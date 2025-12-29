import { useState, useMemo, useEffect } from "react";
import { transformExcel } from "../api/excelApi";
import SortableOutputList from "./SortableOutputList";

export default function ColumnMapper({
    fileId,
    headers,
    bases = [],
    headerDepth,
    onReset
}) {
    const [selectedBase, setSelectedBase] = useState("");
    const [mappingDraft, setMappingDraft] = useState({});
    const [outputOrder, setOutputOrder] = useState([]);

    const [baseConfigs, setBaseConfigs] = useState({
        Assembly: { mapping: {}, add_columns: [], combine: [] },
        Spare: { mapping: {}, add_columns: [], combine: [] }
    });

    const [combineDraft, setCombineDraft] = useState({
        columns: [""],
        delimiter: "|",
        target: "",
        source: ""
    });

    const [editIndex, setEditIndex] = useState(null);

    /* ---------------- HEADERS ---------------- */

    const headerGroups = useMemo(
        () => (headers && typeof headers === "object" ? headers : {}),
        [headers]
    );

    const flatColumns = useMemo(
        () => Object.values(headerGroups).flat(),
        [headerGroups]
    );

    /* ---------------- OUTPUT ORDER ---------------- */

    useEffect(() => {
        const cols = new Set();
        Object.values(baseConfigs).forEach(base => {
            Object.values(base.mapping).forEach(v => v && cols.add(v));
            base.add_columns.forEach(c => cols.add(c.name));
            base.combine.forEach(c => cols.add(c.target));
        });
        setOutputOrder(Array.from(cols));
    }, [baseConfigs]);

    /* ---------------- MAPPING ---------------- */

    const saveMapping = () => {
        setBaseConfigs(prev => ({
            ...prev,
            [selectedBase]: {
                ...prev[selectedBase],
                mapping: { ...prev[selectedBase].mapping, ...mappingDraft }
            }
        }));
        setMappingDraft({});
    };

    const removeMapping = key => {
        setBaseConfigs(prev => {
            const updated = { ...prev[selectedBase].mapping };
            delete updated[key];
            return {
                ...prev,
                [selectedBase]: { ...prev[selectedBase], mapping: updated }
            };
        });
    };

    /* ---------------- STATIC ---------------- */

    const addStaticColumn = () => {
        setBaseConfigs(prev => ({
            ...prev,
            [selectedBase]: {
                ...prev[selectedBase],
                add_columns: [...prev[selectedBase].add_columns, { name: "", value: "" }]
            }
        }));
    };

    const updateStatic = (i, field, value) => {
        setBaseConfigs(prev => {
            const updated = [...prev[selectedBase].add_columns];
            updated[i][field] = value;
            return {
                ...prev,
                [selectedBase]: { ...prev[selectedBase], add_columns: updated }
            };
        });
    };

    const removeStatic = i => {
        setBaseConfigs(prev => ({
            ...prev,
            [selectedBase]: {
                ...prev[selectedBase],
                add_columns: prev[selectedBase].add_columns.filter((_, x) => x !== i)
            }
        }));
    };

    /* ---------------- COMBINE ---------------- */

    const addCombineColumn = () =>
        setCombineDraft(p => ({ ...p, columns: [...p.columns, ""] }));

    const saveCombine = () => {
        if (!combineDraft.target || combineDraft.columns.length < 2) return;

        setBaseConfigs(prev => {
            const list = [...prev[selectedBase].combine];
            editIndex !== null ? (list[editIndex] = combineDraft) : list.push(combineDraft);

            return {
                ...prev,
                [selectedBase]: { ...prev[selectedBase], combine: list }
            };
        });

        setCombineDraft({ columns: [""], delimiter: "|", target: "", source: "" });
        setEditIndex(null);
    };

    const editCombine = (rule, i) => {
        setCombineDraft(rule);
        setEditIndex(i);
    };

    const deleteCombine = i => {
        setBaseConfigs(prev => ({
            ...prev,
            [selectedBase]: {
                ...prev[selectedBase],
                combine: prev[selectedBase].combine.filter((_, x) => x !== i)
            }
        }));
    };

    /* ---------------- SUBMIT ---------------- */

    const submit = async () => {
        const payload = {
            file_id: fileId,
            header_depth: headerDepth,
            mapping: {
                ...baseConfigs.Assembly.mapping,
                ...baseConfigs.Spare.mapping
            },
            base_rules: baseConfigs,
            output_order: outputOrder
        };

        const res = await transformExcel(payload);
        window.open("http://localhost:8000" + res.data.download_url);
    };

    /* ---------------- UI ---------------- */

    return (
        <div className="container-fluid py-4">
            <div className="row g-4">

                {/* LEFT */}
                <div className="col-md-7">

                    {/* BASE */}
                    <div className="card shadow-sm mb-3">
                        <div className="card-body">
                            <select className="form-select" value={selectedBase}
                                onChange={e => setSelectedBase(e.target.value)}>
                                <option value="">Select Base</option>
                                {bases.map(b => <option key={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* MAPPING */}
                    {selectedBase && (
                        <div className="card shadow-sm mb-3">
                            <div className="card-header fw-bold">Column Mapping</div>
                            <div className="card-body">
                                {Object.entries(headerGroups).map(([g, cols]) => (
                                    <div key={g} className="mb-3">
                                        <strong>{g}</strong>
                                        {cols.map(c => (
                                            <div key={c.key} className="my-2 row">
                                               
                                                    <div className="col-md-4 text-start">
                                                        <label>{c.label}</label>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <input
                                                            className="form-control"
                                                            placeholder={c.label}
                                                            value={mappingDraft[c.key] || baseConfigs[selectedBase].mapping[c.key] || ""}
                                                            onChange={e =>
                                                                setMappingDraft(p => ({ ...p, [c.key]: e.target.value }))
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-md-2">
                                                        {baseConfigs[selectedBase].mapping[c.key] && (
                                                            <button className="btn btn-outline-danger ms-2"
                                                                onClick={() => removeMapping(c.key)}>✖</button>
                                                        )}
                                                    </div>
                                              



                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <button className="btn btn-primary" onClick={saveMapping}>Save Mapping</button>
                            </div>
                        </div>
                    )}

                    {/* STATIC */}
                    {selectedBase && (
                        <div className="card shadow-sm mb-3">
                            <div className="card-header fw-bold">Static Columns</div>
                            <div className="card-body">
                                {baseConfigs[selectedBase].add_columns.map((c, i) => (
                                    <div key={i} className="row g-2 mb-2">
                                        <div className="col"><input className="form-control"
                                            value={c.name} placeholder="Name"
                                            onChange={e => updateStatic(i, "name", e.target.value)} /></div>
                                        <div className="col"><input className="form-control"
                                            value={c.value} placeholder="Value"
                                            onChange={e => updateStatic(i, "value", e.target.value)} /></div>
                                        <div className="col-auto">
                                            <button className="btn btn-outline-danger"
                                                onClick={() => removeStatic(i)}>✖</button>
                                        </div>
                                    </div>
                                ))}
                                <button className="btn btn-outline-secondary" onClick={addStaticColumn}>
                                    ➕ Add Static
                                </button>
                            </div>
                        </div>
                    )}

                    {/* COMBINE */}
                    {selectedBase && (
                        <div className="card shadow-sm mb-3">
                            <div className="card-header fw-bold">Combine Columns</div>
                            <div className="card-body">
                                {combineDraft.columns.map((c, i) => (
                                    <select key={i} className="form-select mb-2"
                                        value={c}
                                        onChange={e => {
                                            const cols = [...combineDraft.columns];
                                            cols[i] = e.target.value;
                                            setCombineDraft({ ...combineDraft, columns: cols });
                                        }}>
                                        <option value="">Select Column</option>
                                        {flatColumns.map(fc =>
                                            <option key={fc.key} value={fc.key}>{fc.label}</option>
                                        )}
                                    </select>
                                ))}

                                <button className="btn btn-sm btn-secondary mb-2"
                                    onClick={addCombineColumn}>➕ Column</button>

                                <input className="form-control mb-2" placeholder="Delimiter"
                                    value={combineDraft.delimiter}
                                    onChange={e => setCombineDraft({ ...combineDraft, delimiter: e.target.value })} />

                                <input className="form-control mb-2" placeholder="Source (Prev / Next / Equipment)"
                                    value={combineDraft.source}
                                    onChange={e => setCombineDraft({ ...combineDraft, source: e.target.value })} />

                                <input className="form-control mb-2" placeholder="Target"
                                    value={combineDraft.target}
                                    onChange={e => setCombineDraft({ ...combineDraft, target: e.target.value })} />

                                <button className="btn btn-primary" onClick={saveCombine}>
                                    {editIndex !== null ? "Update Combine" : "Save Combine"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* OUTPUT */}
                    <div className="card shadow-sm mb-3">
                        <div className="card-header fw-bold">Output Order</div>
                        <div className="card-body">
                            <SortableOutputList items={outputOrder} onChange={setOutputOrder} />
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button className="btn btn-success" onClick={submit}>Transform</button>
                        <button className="btn btn-danger" onClick={onReset}>Reset</button>
                    </div>

                </div>

                {/* RIGHT PREVIEW */}
                <div className="col-md-5">
                    <div className="accordion shadow-sm" id="previewAccordion">
                        {["Assembly", "Spare"].map((base, idx) => {
                            const cfg = baseConfigs[base] || {};

                            return (
                                <div key={base} className="accordion-item">
                                    <h2 className="accordion-header">
                                        <button
                                            className={`accordion-button ${idx !== 0 ? "collapsed" : ""}`}
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#preview-${base}`}
                                        >
                                            {base} Preview
                                        </button>
                                    </h2>

                                    <div
                                        id={`preview-${base}`}
                                        className={`accordion-collapse collapse ${idx === 0 ? "show" : ""}`}
                                        data-bs-parent="#previewAccordion"
                                    >
                                        <div className="accordion-body small">

                                            {/* ================= MAPPING ================= */}
                                            <div className="mb-3">
                                                <div className="fw-bold mb-1">Mapped Columns</div>

                                                {cfg.mapping && Object.keys(cfg.mapping).length > 0 ? (
                                                    Object.entries(cfg.mapping).map(([src, tgt], i) => (
                                                        <div
                                                            key={i}
                                                            className="d-flex justify-content-between border-bottom py-1"
                                                        >
                                                            <span>{src}</span>
                                                            <span className="text-muted">→ {tgt}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-muted fst-italic">
                                                        No mappings added
                                                    </div>
                                                )}
                                            </div>

                                            {/* ================= STATIC ================= */}
                                            <div className="mb-3">
                                                <div className="fw-bold mb-1">Static Columns</div>

                                                {cfg.add_columns && cfg.add_columns.length > 0 ? (
                                                    cfg.add_columns.map((col, i) => (
                                                        <div
                                                            key={i}
                                                            className="d-flex justify-content-between border-bottom py-1"
                                                        >
                                                            <span>{col.name}</span>
                                                            <span className="text-muted">= {col.value}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-muted fst-italic">
                                                        No static columns
                                                    </div>
                                                )}
                                            </div>

                                            {/* ================= COMBINE ================= */}
                                            <div>
                                                <div className="fw-bold mb-1">Combined Columns</div>

                                                {cfg.combine && cfg.combine.length > 0 ? (
                                                    cfg.combine.map((c, i) => (
                                                        <div
                                                            key={i}
                                                            className="border rounded p-2 mb-2"
                                                        >
                                                            <div className="fw-semibold">
                                                                Target: {c.target}
                                                            </div>

                                                            <div className="text-muted small">
                                                                {c.columns?.join(" | ")}
                                                            </div>

                                                            {c.source && (
                                                                <span className="badge bg-info mt-1">
                                                                    Source: {c.source}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-muted fst-italic">
                                                        No combine rules
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>

            </div>
        </div>
    );
}
