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

class Card(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, sa_column=Column(GUID, primary_key=True))
    title: str = Field()
    branch: str = Field()
    pilot_stream: str = Field()
    main_result: str = Field()
    is_positive_result_1: bool = Field(default=False, nullable=False)
    result_old_1: str = Field()
    result_new_1: str = Field()
    is_positive_result_2: bool = Field(default=False, nullable=False)
    result_old_2: str = Field()
    result_new_2: str = Field()
    is_positive_result_3: bool = Field(default=False, nullable=False)
    result_old_3: str = Field()
    result_new_3: str = Field()
    events: list[str] = Field(sa_column=Column(JSON))
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

    def _get_formatted_percent(self, old: str, new: str) -> str:
        result = int((float(new) / float(old) - 1) * 100)
        return self._format_result_percent(result)

    async def to_pptx(self) -> bytes:
        presentation = Presentation(TEMPLATE_PATH)
        await asyncio.to_thread(
            pptx.render, 
            presentation, 
            {
                'title': self.title,
                'branch': self.branch,
                'pilot_stream': self.pilot_stream.upper(),
                'result_title_1': 'Результат 1',
                'result_old_1': str(self.result_old_1),
                'result_new_1': str(self.result_new_1),
                'result_percent_1': self._get_formatted_percent(self.result_old_1, self.result_new_1),
                'result_title_2': 'Результат 2',
                'result_old_2': str(self.result_old_2),
                'result_new_2': str(self.result_new_2),
                'result_percent_2': self._get_formatted_percent(self.result_old_2, self.result_new_2),
                'result_title_3': 'Результат 3',
                'result_old_3': str(self.result_old_3),
                'result_new_3': str(self.result_new_3),
                'result_percent_3': self._get_formatted_percent(self.result_old_3, self.result_new_3),
                'multiplier': '{:.2f}'.format(float(self.result_new_1) / float(self.result_old_1))
            }
        )
        slide, shape = await asyncio.to_thread(pptx.find_by_token, presentation, '{{events}}')
        pptx.fill_list(shape.text_frame, self.events)

        results = [
            self.is_positive_result_1,
            self.is_positive_result_2,
            self.is_positive_result_3
        ]
        
        arrows = []
        for slide in presentation.slides:
            for shape in pptx.iter_shapes(slide.shapes):
                if shape.shape_type != MSO_SHAPE_TYPE.AUTO_SHAPE:
                    continue
                if shape.auto_shape_type != MSO_SHAPE.UP_ARROW:
                    continue
                
                arrows.append(shape)

        arrows.sort(key=lambda x: (x.top, x.left))
        for i, shape in enumerate(arrows):
                xfrm = shape._element.spPr.get_or_add_xfrm()
                if not results[i]:
                    current_flip = bool(int(xfrm.get('flipV') or "0"))
                    new_flip = '0' if current_flip else '1'
                    xfrm.set('flipV', new_flip)
                    shape.fill.solid()
                    shape.fill.fore_color.rgb = RGBColor.from_string('FF0000')
        
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
    