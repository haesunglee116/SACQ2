#!/usr/bin/env python3
"""Generate the result tables in index.html and js/data.js from data/paper_tables.json.

The site stays buildless at serve time: this script is run by hand after the
manuscript numbers change, and its output is committed. Table fragments are
written between ``<!-- BUILD:name -->`` and ``<!-- /BUILD:name -->`` markers.

Usage:  python tools/build_site.py
"""
from __future__ import annotations

import json
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "paper_tables.json"
INDEX = ROOT / "index.html"
DATA_JS = ROOT / "js" / "data.js"

NOTE_MARK = {"twla": "†", "ternary": "‡"}


def fmt(value, digits):
    return f"{value:.{digits}f}"


def row_class(row):
    classes = []
    if row.get("ours"):
        classes.append("ours")
    if row.get("featured"):
        classes.append("featured")
    if row.get("ref"):
        classes.append("reference")
    if row.get("sep"):
        classes.append("separated")
    return f' class="{" ".join(classes)}"' if classes else ""


def method_cell(row, key="method"):
    name = escape(row[key])
    mark = NOTE_MARK.get(row.get("note", ""))
    if mark:
        name += f' <span class="note-mark" aria-hidden="true">{mark}</span>'
    indent = ' class="indent"' if row.get("indent") else ""
    return f'<th scope="row"{indent}>{name}</th>'


def best_in_group(rows, keys, digits):
    """Return {key: best value} over non-reference rows, matching the paper's bolding."""
    best = {}
    scored = [r for r in rows if not r.get("ref") and not r.get("exclude_best")]
    if len(scored) < 2:
        return best
    for key in keys:
        best[key] = max(r[key] for r in scored)
    return best


def num_cell(row, key, digits, best=None):
    value = row[key]
    text = fmt(value, digits)
    eligible = not row.get("ref") and not row.get("exclude_best")
    if eligible and best and key in best and abs(value - best[key]) < 1e-9:
        return f"<td><strong>{text}</strong></td>"
    return f"<td>{text}</td>"


def wrap_table(caption, head, body, aria):
    return (
        f'<div class="table-scroll" tabindex="0" role="region" aria-label="{escape(aria)}">\n'
        f'<table class="results-table">\n<caption>{escape(caption)}</caption>\n'
        f"<thead><tr>{head}</tr></thead>\n<tbody>\n{body}</tbody>\n</table>\n</div>"
    )


def th_cols(columns):
    return "".join(f'<th scope="col">{escape(c)}</th>' for c in columns)


def group_row(label, span):
    return f'<tr class="group-row"><th scope="rowgroup" colspan="{span}">{escape(label)}</th></tr>\n'


def build_success_table(table, suite_keys, digits_suite=1, digits_avg=2, with_memory=True, aria=""):
    columns = table["columns"]
    body = ""
    for group in table["groups"]:
        if group["label"]:
            body += group_row(group["label"], len(columns))
        best = best_in_group(group["rows"], suite_keys + ["avg"], digits_suite)
        for row in group["rows"]:
            cells = method_cell(row) + f"<td>{escape(row['bpw'])}</td>"
            for key in suite_keys:
                cells += num_cell(row, key, digits_suite, best)
            cells += num_cell(row, "avg", digits_avg, best)
            if with_memory:
                cells += f"<td>{fmt(row['memory'], 3)}</td>"
            body += f"<tr{row_class(row)}>{cells}</tr>\n"
    return wrap_table(table["caption"], th_cols(columns), body, aria)


def build_table2(table, protocol_key):
    protocol = next(p for p in table["protocols"] if p["key"] == protocol_key)
    columns = table["columns"]
    keys = ["pick", "move", "drawer", "apple"]
    best = best_in_group(protocol["rows"], keys + ["avg"], 2)
    body = ""
    for row in protocol["rows"]:
        cells = method_cell(row) + f"<td>{escape(row['bpw'])}</td>"
        for key in keys:
            cells += num_cell(row, key, 2, best)
        cells += num_cell(row, "avg", 2, best)
        cells += f"<td>{fmt(row['memory'], 3)}</td>"
        body += f"<tr{row_class(row)}>{cells}</tr>\n"
    caption = f"{protocol['label']}. " + table["caption"]
    return wrap_table(caption, th_cols(columns), body, f"SimplER {protocol['label']} results, horizontally scrollable")


def flag(value):
    if value is None:
        return "<td>–</td>"
    return '<td><span class="check" aria-label="yes">✓</span></td>' if value else "<td>–</td>"


def build_table3(table):
    columns = table["columns"]
    keys = ["spatial", "object", "goal", "long"]
    body = ""
    for group in table["groups"]:
        if group["label"]:
            body += group_row(group["label"], len(columns))
        for row in group["rows"]:
            cells = method_cell(row, "setting")
            cells += flag(row["alloc"]) + flag(row["struct"]) + flag(row["refine"])
            for key in keys:
                cells += num_cell(row, key, 1)
            cells += num_cell(row, "avg", 2)
            body += f"<tr{row_class(row)}>{cells}</tr>\n"
    return wrap_table(table["caption"], th_cols(columns), body, "Component ablation, horizontally scrollable")


def build_table_efficiency(table):
    columns = table["columns"]
    keys = ["spatial", "object", "goal", "long"]
    body = ""
    for row in table["rows"]:
        cells = method_cell(row, "config")
        for key in keys:
            cells += num_cell(row, key, 1)
        cells += num_cell(row, "avg", 2)
        latency = fmt(row["latency"], 2)
        speed = escape(row["speed"])
        if row.get("featured"):
            latency, speed = f"<strong>{latency}</strong>", f"<strong>{speed}</strong>"
        cells += f"<td>{latency}</td><td>{speed}</td>"
        body += f"<tr{row_class(row)}>{cells}</tr>\n"
    return wrap_table(table["caption"], th_cols(columns), body, "Inference efficiency, horizontally scrollable")


def build_table7(table):
    columns = table["columns"]
    keys = ["spatial", "object", "goal", "long"]
    body = ""
    for row in table["rows"]:
        cells = method_cell(row) + f"<td>{escape(row['bpw'])}</td>"
        for key in keys:
            cells += num_cell(row, key, 2)
        cells += num_cell(row, "avg", 2)
        body += f"<tr{row_class(row)}>{cells}</tr>\n"
    return wrap_table(table["caption"], th_cols(columns), body, "LIBERO-Pro results, horizontally scrollable")


def build_table8(table):
    columns = ["Calib. data", "Fitting", "Spatial", "Object", "Goal", "Long", "Avg.", "Δ vs. Struct."]
    keys = ["spatial", "object", "goal", "long"]
    body = ""
    bf = None
    body += (
        '<tr class="reference"><td>–</td><th scope="row">BF16</th>'
        "<td>94.2</td><td>97.6</td><td>95.2</td><td>89.4</td><td>94.10</td><td>–</td></tr>\n"
    )
    for i, budget in enumerate(table["budgets"]):
        # Bold the best value per column within this budget, as in the paper.
        best = {}
        for key in keys + ["avg"]:
            best[key] = max(f[key][i] for f in table["fittings"])
        for j, fitting in enumerate(table["fittings"]):
            first = f'<td rowspan="{len(table["fittings"])}" class="budget-cell">{budget:,}</td>' if j == 0 else ""
            cls = ' class="ours"' if fitting["key"] == "structure" else ""
            cells = first + f'<th scope="row">{escape(fitting["label"])}</th>'
            for key in keys:
                v = fitting[key][i]
                text = fmt(v, 1)
                cells += f"<td><strong>{text}</strong></td>" if abs(v - best[key]) < 1e-9 else f"<td>{text}</td>"
            v = fitting["avg"][i]
            text = fmt(v, 2)
            cells += f"<td><strong>{text}</strong></td>" if abs(v - best["avg"]) < 1e-9 else f"<td>{text}</td>"
            if fitting["key"] == "structure":
                delta = "0.00"
            else:
                d = table["delta_vs_struct"][fitting["key"]][i]
                delta = f"{d:+.2f}"
            cells += f"<td>{delta}</td>"
            body += f"<tr{cls}>{cells}</tr>\n"
    return wrap_table(table["caption"], th_cols(columns), body, "Limited refinement study, horizontally scrollable")


def inject(html, name, fragment):
    pattern = re.compile(rf"(<!-- BUILD:{name} -->)(.*?)(<!-- /BUILD:{name} -->)", re.S)
    if not pattern.search(html):
        raise SystemExit(f"marker BUILD:{name} not found in index.html")
    return pattern.sub(lambda m: f"{m.group(1)}\n{fragment}\n{m.group(3)}", html, count=1)


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    html = INDEX.read_text(encoding="utf-8")

    suites = ["spatial", "object", "goal", "long"]
    fragments = {
        "table1": build_success_table(data["table1_libero"], suites, aria="LIBERO results, horizontally scrollable"),
        "table2_vm": build_table2(data["table2_simpler"], "vm"),
        "table2_va": build_table2(data["table2_simpler"], "va"),
        "table_efficiency": build_table_efficiency(data["table_inference_efficiency"]),
        "table3": build_table3(data["table3_ablation"]),
        "table6": build_success_table(data["table6_oft"], suites, aria="OpenVLA-OFT results, horizontally scrollable"),
        "table7": build_table7(data["table7_libero_pro"]),
        "table8": build_table8(data["table8_limited_refinement"]),
    }
    for name, fragment in fragments.items():
        html = inject(html, name, fragment)
    INDEX.write_text(html, encoding="utf-8")

    chart_data = {
        "success": data["figure1a_success_vs_bpw"],
        "efficiency": data["figure1b_efficiency"],
        "budget": {
            "budgets": data["table8_limited_refinement"]["budgets"],
            "fittings": data["table8_limited_refinement"]["fittings"],
            "bf16": data["bf16"]["libero"],
        },
    }
    DATA_JS.write_text(
        "// Generated by tools/build_site.py from data/paper_tables.json. Do not edit by hand.\n"
        "window.SACQ_DATA = " + json.dumps(chart_data, indent=2, ensure_ascii=False) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {len(fragments)} table fragments into {INDEX.name} and {DATA_JS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
