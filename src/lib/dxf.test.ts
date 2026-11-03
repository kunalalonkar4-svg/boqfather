import { describe, expect, it } from "vitest";
import { roomsFromDxf, sizeInText } from "./dxf";
import { validSignature } from "./server/razorpay";
import { createHmac } from "node:crypto";

const rect = (x: number, y: number, w: number, h: number) =>
  [
    "0",
    "LWPOLYLINE",
    "8",
    "0",
    "90",
    "4",
    "70",
    "1",
    "10",
    x,
    "20",
    y,
    "10",
    x + w,
    "20",
    y,
    "10",
    x + w,
    "20",
    y + h,
    "10",
    x,
    "20",
    y + h,
  ].join("\n");
const text = (x: number, y: number, s: string, kind = "TEXT") =>
  ["0", kind, "8", "0", "10", x, "20", y, "40", "200", "1", s].join("\n");
const dxf = (ents: string[]) =>
  [
    "0",
    "SECTION",
    "2",
    "HEADER",
    "9",
    "$INSUNITS",
    "70",
    "4",
    "0",
    "ENDSEC",
    "0",
    "SECTION",
    "2",
    "ENTITIES",
    ...ents,
    "0",
    "ENDSEC",
    "0",
    "EOF",
  ].join("\n");

describe("DXF plan reader", () => {
  it("reads sizes written in feet-inch", () => {
    expect(sizeInText(`12'6"x10'0"`)).toEqual([12.5, 10]);
    expect(sizeInText(`12'-6" X 10'`)).toEqual([12.5, 10]);
    expect(sizeInText("3.6x3.0")?.map((x) => Math.round(x * 10) / 10)).toEqual([
      11.8, 9.8,
    ]);
  });
  it("finds rooms, their sizes and floors", () => {
    const ft = 304.8;
    const ents = [
      text(0, 16000, "GROUND FLOOR PLAN"),
      rect(0, 0, 7000, 13000),
      rect(100, 100, 12 * ft, 14 * ft),
      text(1500, 2000, "HALL"),
      rect(4000, 100, 9 * ft, 10 * ft),
      text(5000, 1500, `KITCHEN 9'0"x10'0"`, "MTEXT"),
      text(20000, 16000, "FIRST FLOOR PLAN"),
      rect(20000, 0, 7000, 13000),
      rect(20100, 100, 11 * ft, 12 * ft),
      text(21500, 1800, "BED ROOM"),
      rect(24000, 100, 5 * ft, 7 * ft),
      text(24700, 1000, "TOILET"),
    ];
    const p = roomsFromDxf(dxf(ents));
    expect(p.floors.length).toBe(2);
    expect(p.floors[0].map((r) => r.type).sort()).toEqual(["hall", "kitchen"]);
    expect(p.floors[0].find((r) => r.type === "hall")).toMatchObject({
      L: 14,
      B: 12,
    });
    expect(p.floors[0].find((r) => r.type === "kitchen")).toMatchObject({
      L: 10,
      B: 9,
    });
    expect(p.floors[1].map((r) => r.type).sort()).toEqual([
      "bedroom",
      "toilet",
    ]);
  });
});

describe("Razorpay signature", () => {
  it("accepts the right signature and refuses a wrong one", () => {
    const sig = createHmac("sha256", "s3cret")
      .update("order_1|pay_1")
      .digest("hex");
    expect(validSignature("order_1", "pay_1", sig, "s3cret")).toBe(true);
    expect(validSignature("order_1", "pay_2", sig, "s3cret")).toBe(false);
    expect(validSignature("order_1", "pay_1", "", "s3cret")).toBe(false);
  });
});
