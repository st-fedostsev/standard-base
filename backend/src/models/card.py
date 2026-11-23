from sqlmodel import Field, Session, SQLModel, Relationship, Column, Enum, JSON
from sqlmodel import LargeBinary
import uuid
import enum
from .guid import GUID
import datetime
import asyncio
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE, MSO_SHAPE_TYPE
from pptx.dml.color import RGBColor
from pptx.parts.image import Image
from utils import pptx
import io
from pathlib import Path

class CardStatus(str, enum.Enum):
    draft = 'draft'
    review = 'review'
    published = 'published'
    returned = 'returned'
    archived = 'archived'

class CardVisibility(str, enum.Enum):
    public = 'public'
    protected = 'protected'
    private = 'private'

class CardCategory(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    name: str = Field(nullable=False)

BASE_DIR = Path(__file__).parent.resolve()
TEMPLATE_PATH = (BASE_DIR / 'templates' / 'template.pptx')
DEFAULT_PHOTO_PATH = (BASE_DIR / 'templates' / 'nophoto.jpg')

class Card(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    title: str = Field()
    industry: str = Field()
    pilot_stream: str = Field()
    result_title_1: str = Field()
    is_positive_result_1: bool = Field(default=False, nullable=False)
    result_old_1: float = Field()
    result_new_1: float = Field()
    result_title_2: str = Field()
    is_positive_result_2: bool = Field(default=False, nullable=False)
    result_old_2: float = Field()
    result_new_2: float = Field()
    result_title_3: str = Field()
    is_positive_result_3: bool = Field(default=False, nullable=False)
    result_old_3: float = Field()
    result_new_3: float = Field()
    activities: list[str] = Field(sa_column=Column(JSON))
    photo: bytes = Field(sa_column=Column(LargeBinary))
    category_id: uuid.UUID = Field(sa_column=Column(GUID))
    author_id: uuid.UUID = Field(sa_column=Column(GUID))
    status: CardStatus = Field(default=CardStatus.review, sa_column=Column(Enum(CardStatus)))
    visibility: CardVisibility = Field(default=CardVisibility.private, sa_column=Column(Enum(CardVisibility)))
    created_at: datetime.datetime = Field()

    def _format_result_percent(self, x) -> str:
        if x > 0:
            return f'+{x}'
        return str(x)

    def _get_formatted_percent(self, old: float, new: float) -> str:
        result = int((new / old - 1) * 100)
        return self._format_result_percent(result)

    @staticmethod
    async def from_pptx(user_id: uuid.UUID, file_data: bytes, category_id: uuid.UUID, visibility: CardVisibility):
        buf = io.BytesIO()
        buf.write(file_data)
        presentation = Presentation(buf)

        final_slide = None
        for slide in presentation.slides:
            for shape in pptx.iter_shapes(slide.shapes):
                if shape.has_text_frame and 'Примеры вскрытия резервов производительности' in shape.text_frame.text:
                    final_slide = slide
                    break
        
        if final_slide is None:
            return None

        shapes_sorted = []
        for shape in pptx.iter_shapes(slide.shapes):
            shapes_sorted.append(shape)
        
        shapes_sorted.sort(key=lambda x: (x.top, x.left))

        texts = []
        for shape in shapes_sorted:
            if shape.has_text_frame:
                texts.append(shape.text_frame.text)

        photo = None
        arrows = []
        for slide in presentation.slides:
            for shape in shapes_sorted:
                if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                    slide_part, rId = shape.part, shape._element.blip_rId
                    image_part = slide_part.related_part(rId)
                    photo = image_part.blob
                    continue
                if shape.shape_type != MSO_SHAPE_TYPE.AUTO_SHAPE:
                    continue
                if shape.auto_shape_type != MSO_SHAPE.UP_ARROW:
                    continue
                
                arrows.append(shape)
        arrows.sort(key=lambda x: (x.top, x.left))

        red = RGBColor.from_string('FF0000')
        activities_max_idx = len(texts) - 30
        activities = []
        for i in range(9, activities_max_idx + 1):
            activities.append(texts[i].strip())

        return Card(
            title=texts[2].split('\n')[0],
            industry=texts[2].split('\n')[1],
            pilot_stream=texts[3],
            result_title_1=texts[8],
            is_positive_result_1=arrows[0].fill.fore_color.rgb != red,
            result_old_1=texts[-24],
            result_new_1=texts[-28],
            
            result_title_2=texts[-20],
            is_positive_result_2=arrows[1].fill.fore_color.rgb != red,
            result_old_2=texts[-14],
            result_new_2=texts[-16],

            result_title_3=texts[-10],
            is_positive_result_3=arrows[2].fill.fore_color.rgb != red,
            result_old_3=texts[-3],
            result_new_3=texts[-5],

            photo=photo,
            activities=activities,
            category_id=category_id,
            author_id=user_id,
            status=CardStatus.review,
            visibility=visibility,
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )

    async def to_pptx(self) -> bytes:
        presentation = Presentation(TEMPLATE_PATH)
        await asyncio.to_thread(
            pptx.render, 
            presentation, 
            {
                'title': self.title,
                'industry': self.industry,
                'pilot_stream': self.pilot_stream.upper(),
                'result_title_1': self.result_title_1,
                'result_old_1': '{:.1f}'.format(self.result_old_1),
                'result_new_1': '{:.1f}'.format(self.result_new_1),
                'result_percent_1': self._get_formatted_percent(self.result_old_1, self.result_new_1),
                'result_title_2': self.result_title_2,
                'result_old_2': '{:.1f}'.format(self.result_old_2),
                'result_new_2': '{:.1f}'.format(self.result_new_2),
                'result_percent_2': self._get_formatted_percent(self.result_old_2, self.result_new_2),
                'result_title_3': self.result_title_3,
                'result_old_3': '{:.1f}'.format(self.result_old_3),
                'result_new_3': '{:.1f}'.format(self.result_new_3),
                'result_percent_3': self._get_formatted_percent(self.result_old_3, self.result_new_3),
                'multiplier': '{:.2f}'.format(float(self.result_new_1) / float(self.result_old_1))
            }
        )
        slide, shape = await asyncio.to_thread(pptx.find_by_token, presentation, '{{activities}}')
        pptx.fill_list(shape.text_frame, self.activities)

        results = [
            self.is_positive_result_1,
            self.is_positive_result_2,
            self.is_positive_result_3
        ]
        arrows_up = [
            self.result_new_1 > self.result_old_1,
            self.result_new_2 > self.result_old_2,
            self.result_new_3 > self.result_old_3,
        ]
        
        arrows = []
        for slide in presentation.slides:
            for shape in pptx.iter_shapes(slide.shapes):
                if shape.shape_type == MSO_SHAPE_TYPE.PICTURE:
                    slide_part, rId = shape.part, shape._element.blip_rId
                    image_part = slide_part.related_part(rId)
                    if self.photo is not None:
                        image_part.blob = self.photo
                    else:
                        with open(DEFAULT_PHOTO_PATH, 'rb') as f:
                            image_part.blob = f.read()
                    continue
                if shape.shape_type != MSO_SHAPE_TYPE.AUTO_SHAPE:
                    continue
                if shape.auto_shape_type != MSO_SHAPE.UP_ARROW:
                    continue
                
                arrows.append(shape)

        arrows.sort(key=lambda x: (x.top, x.left))
        for i, shape in enumerate(arrows):
                xfrm = shape._element.spPr.get_or_add_xfrm()
                if not results[i]:
                    shape.fill.solid()
                    shape.fill.fore_color.rgb = RGBColor.from_string('FF0000')
                if not arrows_up[i]:
                    current_flip = bool(int(xfrm.get('flipV') or "0"))
                    new_flip = '0' if current_flip else '1'
                    xfrm.set('flipV', new_flip)
        
        percents = []
        for i, _, shape in pptx.find_all_by_token(presentation, '%'):
            percents.append(shape)
        
        percents.sort(key=lambda x: (x.top, x.left))
        for i, shape in enumerate(percents):
            xfrm = shape._element.spPr.get_or_add_xfrm()
            if not results[i]:
                for paragraph in shape.text_frame.paragraphs:
                    for run in paragraph.runs:
                        run.font.color.rgb = RGBColor.from_string('FF0000')

        buf = io.BytesIO()
        presentation.save(buf)
        return buf.getvalue()
    