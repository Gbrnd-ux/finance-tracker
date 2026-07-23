import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateNewAllocations, calculateScaledAllocations } from "./allocation";

// Dummy types for testing
type Category = {
  id: string;
  defaultPercentage: number;
};

type Allocation = {
  id: string;
  amount: number;
};

describe("allocation logic", () => {
  describe("calculateNewAllocations", () => {
    test("harus menghitung alokasi baru dengan benar berdasarkan persentase", () => {
      const categories: Category[] = [
        { id: "cat-1", defaultPercentage: 50 },
        { id: "cat-2", defaultPercentage: 30 },
        { id: "cat-3", defaultPercentage: 20 },
      ];
      const amount = 100000;

      // Type assertion because calculateNewAllocations expects Category from Prisma
      const result = calculateNewAllocations(amount, categories as any);

      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].categoryId, "cat-1");
      assert.strictEqual(result[0].amount, 50000); // 50%
      assert.strictEqual(result[1].categoryId, "cat-2");
      assert.strictEqual(result[1].amount, 30000); // 30%
      assert.strictEqual(result[2].categoryId, "cat-3");
      assert.strictEqual(result[2].amount, 20000); // 20%
    });

    test("harus mengembalikan array kosong jika kategori kosong", () => {
      const result = calculateNewAllocations(100000, []);
      assert.deepStrictEqual(result, []);
    });
  });

  describe("calculateScaledAllocations", () => {
    test("harus menyesuaikan alokasi lama secara proporsional sesuai uang baru", () => {
      const oldAmount = 100000;
      const newAmount = 150000; // Naik 50% (ratio 1.5)
      
      const oldAllocations: Allocation[] = [
        { id: "alloc-1", amount: 50000 },
        { id: "alloc-2", amount: 30000 },
        { id: "alloc-3", amount: 20000 },
      ];

      // Type assertion for Allocation from Prisma
      const result = calculateScaledAllocations(newAmount, oldAmount, oldAllocations as any);

      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].id, "alloc-1");
      assert.strictEqual(result[0].amount, 75000); // 50000 * 1.5
      assert.strictEqual(result[1].id, "alloc-2");
      assert.strictEqual(result[1].amount, 45000); // 30000 * 1.5
      assert.strictEqual(result[2].id, "alloc-3");
      assert.strictEqual(result[2].amount, 30000); // 20000 * 1.5
    });

    test("harus mengembalikan array kosong jika nominal lama 0", () => {
      const oldAllocations: Allocation[] = [{ id: "alloc-1", amount: 50000 }];
      const result = calculateScaledAllocations(150000, 0, oldAllocations as any);
      assert.deepStrictEqual(result, []);
    });

    test("harus mengembalikan array kosong jika nominal tidak berubah", () => {
      const oldAllocations: Allocation[] = [{ id: "alloc-1", amount: 50000 }];
      const result = calculateScaledAllocations(100000, 100000, oldAllocations as any);
      assert.deepStrictEqual(result, []);
    });
  });
});
