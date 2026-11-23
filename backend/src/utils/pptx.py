import re
from copy import deepcopy
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.oxml.ns import qn

TOKEN = re.compile(r"\{\{\s*(\w+)\s*\}\}")

def iter_shapes(shapes):
    for shape in shapes:
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            yield from iter_shapes(shape.shapes)
        else:
            yield shape

def find_by_token(prs, token):
    for slide in prs.slides:
        for shape in iter_shapes(slide.shapes):
            if shape.has_text_frame and token in shape.text_frame.text:
                return slide, shape
    return None, None

def find_all_by_token(prs, token):
    for i, slide in enumerate(prs.slides):
        for shape in iter_shapes(slide.shapes):
            if shape.has_text_frame and token in shape.text_frame.text:
                yield i, slide, shape

def set_para_text(p, text):
    rPr = None
    for r in p.findall(qn("a:r")):
        if rPr is None:
            el = r.find(qn("a:rPr"))
            rPr = deepcopy(el) if el is not None else None
        p.remove(r)
    for tag in ("a:br", "a:fld"):
        for el in p.findall(qn(tag)):
            p.remove(el)

    r = p.makeelement(qn("a:r"), {})
    if rPr is not None:
        r.append(rPr)
    t = r.makeelement(qn("a:t"), {})
    t.text = text
    r.append(t)

    endPr = p.find(qn("a:endParaRPr"))
    if endPr is not None:
        endPr.addprevious(r)
    else:
        p.append(r)

def fill_list(tf, items):
    txBody = tf._txBody
    paras = txBody.findall(qn("a:p"))
    proto = paras[0]

    set_para_text(proto, items[0])
    for p in paras[1:]:
        txBody.remove(p)

    for item in items[1:]:
        clone = deepcopy(proto)
        set_para_text(clone, item)
        txBody.append(clone)

def fill_text_frame(tf, mapping):
    for para in tf.paragraphs:
        text = para.text
        if not TOKEN.search(text):
            continue
        new_text = TOKEN.sub(
            lambda m: str(mapping[m.group(1)]) if m.group(1) in mapping else m.group(0),
            text,
        )
        if para.runs:
            para.runs[0].text = new_text
            for run in para.runs[1:]:
                run.text = ""
        else:
            para.text = new_text

def fill_shapes(shapes, mapping):
    for shape in shapes:
        if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
            fill_shapes(shape.shapes, mapping)
        elif shape.has_table:
            for row in shape.table.rows:
                for cell in row.cells:
                    fill_text_frame(cell.text_frame, mapping)
        elif shape.has_text_frame:
            fill_text_frame(shape.text_frame, mapping)

def render(prs, mapping, include_masters=True):
    for slide in prs.slides:
        fill_shapes(slide.shapes, mapping)
        if slide.has_notes_slide:
            fill_text_frame(slide.notes_slide.notes_text_frame, mapping)
    if include_masters:
        for master in prs.slide_masters:
            fill_shapes(master.shapes, mapping)
            for layout in master.slide_layouts:
                fill_shapes(layout.shapes, mapping)