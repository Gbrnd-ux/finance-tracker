import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { getTargetDateRange, isOverdue } from "./dates";

describe("reminder date logic", () => {
  // Simpan referensi Date asli
  const OriginalDate = global.Date;

  // Kita gunakan waktu dummy 2026-07-23T12:00:00Z untuk konsistensi testing
  const FIXED_SYSTEM_TIME = new Date("2026-07-23T12:00:00Z");

  before(() => {
    // Override global Date dengan sebuah mock yang mereturn waktu tetap ketika dipanggil tanpa argumen
    global.Date = class extends OriginalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(FIXED_SYSTEM_TIME);
        } else {
          // @ts-ignore
          super(...args);
        }
      }
    } as typeof Date;
  });

  after(() => {
    // Kembalikan ke Date asli setelah selesai testing
    global.Date = OriginalDate;
  });

  describe("getTargetDateRange (H-X logic)", () => {
    test("harus menghasilkan rentang tanggal H-3 (3 hari ke depan) dengan jam 00:00:00 sampai 23:59:59", () => {
      // 2026-07-23 ditambah 3 hari => 2026-07-26
      const { start, end } = getTargetDateRange(3);

      assert.strictEqual(start.getFullYear(), 2026);
      assert.strictEqual(start.getMonth(), 6); // Juli (0-indexed)
      assert.strictEqual(start.getDate(), 26);
      assert.strictEqual(start.getHours(), 0);
      assert.strictEqual(start.getMinutes(), 0);
      assert.strictEqual(start.getSeconds(), 0);
      assert.strictEqual(start.getMilliseconds(), 0);

      assert.strictEqual(end.getFullYear(), 2026);
      assert.strictEqual(end.getMonth(), 6);
      assert.strictEqual(end.getDate(), 26);
      assert.strictEqual(end.getHours(), 23);
      assert.strictEqual(end.getMinutes(), 59);
      assert.strictEqual(end.getSeconds(), 59);
      assert.strictEqual(end.getMilliseconds(), 999);
    });

    test("harus menangani perpindahan bulan (contoh H-10 dari tgl 23 Juli => 2 Agustus)", () => {
      const { start } = getTargetDateRange(10);
      
      assert.strictEqual(start.getFullYear(), 2026);
      assert.strictEqual(start.getMonth(), 7); // Agustus (0-indexed)
      assert.strictEqual(start.getDate(), 2);
    });
  });

  describe("isOverdue", () => {
    test("harus mereturn true jika tanggal jatuh tempo sudah lewat hari ini", () => {
      // Waktu dummy adalah 23 Juli 2026, jadi 22 Juli adalah overdue
      assert.strictEqual(isOverdue("2026-07-22T00:00:00"), true);
    });

    test("harus mereturn false jika tanggal jatuh tempo adalah hari ini", () => {
      // Tanggal yang sama tidak dianggap overdue
      assert.strictEqual(isOverdue("2026-07-23T00:00:00"), false);
    });

    test("harus mereturn false jika tanggal jatuh tempo masih di masa depan", () => {
      // Masa depan
      assert.strictEqual(isOverdue("2026-07-26T00:00:00"), false);
    });
  });
});
