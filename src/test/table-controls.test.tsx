import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTableControls, ColumnDef } from "@/lib/table-controls";

interface Row { label: string; page: string; count: number; ym: number }
const data: Row[] = [
  { label: "Telefono", page: "/contatti", count: 5, ym: 202603 },
  { label: "Contattaci", page: "/", count: 12, ym: 202601 },
  { label: "Richiedi disponibilità", page: "/alloggi", count: 9, ym: 202602 },
  { label: "Richiedi informazioni", page: "/", count: 2, ym: 202604 },
];
const columns: ColumnDef<Row>[] = [
  { key: "label", type: "text", accessor: (r) => r.label },
  { key: "page", type: "select", accessor: (r) => r.page },
  { key: "count", type: "number", accessor: (r) => r.count },
  { key: "period", type: "select", accessor: (r) => String(r.ym), sortValue: (r) => r.ym },
];

describe("useTableControls", () => {
  it("ordina numeri in modo crescente e decrescente (non alfabetico)", () => {
    const { result } = renderHook(() => useTableControls(data, columns));
    act(() => result.current.setSort("count", "asc"));
    expect(result.current.rows.map((r) => r.count)).toEqual([2, 5, 9, 12]);
    act(() => result.current.setSort("count", "desc"));
    expect(result.current.rows.map((r) => r.count)).toEqual([12, 9, 5, 2]);
    act(() => result.current.setSort("count", null));
    expect(result.current.rows.map((r) => r.count)).toEqual([5, 12, 9, 2]);
  });

  it("filtra per testo, valori e intervallo numerico, combinati", () => {
    const { result } = renderHook(() => useTableControls(data, columns));
    act(() => result.current.setFilter("label", { text: "richiedi" }));
    expect(result.current.rows).toHaveLength(2);
    act(() => result.current.setFilter("page", { selected: ["/"] }));
    expect(result.current.rows.map((r) => r.label)).toEqual(["Richiedi informazioni"]);
    act(() => result.current.clearFilters());
    act(() => result.current.setFilter("count", { min: "5", max: "10" }));
    expect(result.current.rows.map((r) => r.count)).toEqual([5, 9]);
    expect(result.current.activeFilterCount).toBe(1);
  });

  it("applica prima il filtro, poi l'ordinamento; opzioni ordinate con sortValue", () => {
    const { result } = renderHook(() => useTableControls(data, columns, { key: "count", dir: "desc" }));
    act(() => result.current.setFilter("page", { selected: ["/", "/alloggi"] }));
    expect(result.current.rows.map((r) => r.count)).toEqual([12, 9, 2]);
    expect(result.current.getOptions("period")).toEqual(["202601", "202602", "202603", "202604"]);
  });
});
