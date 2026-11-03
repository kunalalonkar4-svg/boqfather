"""Renders the first sheet of an .xlsx as a spreadsheet-looking HTML page (for the home page screenshot)."""
import html, sys
from openpyxl import load_workbook

src, out = sys.argv[1], sys.argv[2]
wb = load_workbook(src, data_only=True)
ws = wb.worksheets[0]
rows = list(ws.iter_rows(min_row=1, max_row=34, max_col=8, values_only=True))
cols = "ABCDEFGH"
def cell(v):
    if v is None:
        return ""
    if isinstance(v, float):
        return f"{v:,.2f}" if abs(v) < 1000 else f"{v:,.0f}"
    if isinstance(v, int):
        return f"{v:,}"
    return html.escape(str(v))
tabs = "".join(f'<span class="tab{" on" if i == 0 else ""}">{html.escape(s.title)}</span>' for i, s in enumerate(wb.worksheets))
body = "".join(
    "<tr><th>{}</th>{}</tr>".format(
        i + 1,
        "".join(
            f'<td class="{"num" if isinstance(v, (int, float)) else ""}{" b" if i < 4 else ""}">{cell(v)}</td>' for v in r
        ),
    )
    for i, r in enumerate(rows)
)
page = f"""<!doctype html><meta charset="utf-8"><style>
body{{margin:0;font:13px Calibri,Arial,sans-serif;background:#fff;color:#111}}
.bar{{background:#1f6f43;color:#fff;padding:8px 14px;font:600 13px Arial}}
.fx{{border-bottom:1px solid #d4d4d4;padding:5px 10px;color:#555;font:12px Arial}}
table{{border-collapse:collapse;width:100%}}
th,td{{border:1px solid #e1e1e1;padding:3px 7px;white-space:nowrap;max-width:420px;overflow:hidden;text-overflow:ellipsis}}
thead th,tbody th{{background:#f3f3f3;color:#666;font-weight:400;text-align:center}}
td.num{{text-align:right}} td.b{{font-weight:700}}
.tabs{{position:fixed;bottom:0;left:0;right:0;background:#f3f3f3;border-top:1px solid #ccc;padding:4px 8px;font:12px Arial}}
.tab{{padding:3px 12px;margin-right:4px;color:#444}} .tab.on{{background:#fff;border-bottom:2px solid #1f6f43;font-weight:700}}
</style><div class="bar">BOQFather-BOQ.xlsx — Excel</div><div class="fx">fx</div>
<table><thead><tr><th></th>{"".join(f"<th>{c}</th>" for c in cols)}</tr></thead><tbody>{body}</tbody></table>
<div class="tabs">{tabs}</div>"""
open(out, "w").write(page)
