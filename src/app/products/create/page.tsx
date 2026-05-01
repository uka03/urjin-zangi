"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import { ProductsApi } from "@/lib/api/product.api";

const toNumber = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const createProductSchema = z.object({
  title: z.string().min(2, "Title хамгийн багадаа 2 тэмдэгт байна"),
  description: z.string().optional().or(z.literal("")),
  price: z.preprocess(
    toNumber,
    z.number().min(0, "Price 0-ээс бага байж болохгүй"),
  ),
  stock: z.preprocess(
    toNumber,
    z
      .number()
      .int("Stock бүхэл тоо байна")
      .min(0, "Stock 0-ээс бага байж болохгүй"),
  ),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

function parseApiError(err: unknown): string {
  if (err instanceof Error) return err.message;

  if (typeof err === "object" && err !== null) {
    const anyErr = err as Record<string, unknown>;

    // fetch wrapper error
    if (typeof anyErr?.message === "string") return anyErr.message;

    // Nest style { message: string | string[], error, statusCode }
    const msg = anyErr?.message;
    if (Array.isArray(msg) && msg.length) return msg.join(", ");
    if (typeof msg === "string") return msg;

    // fallback
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }

  return "Unknown error";
}

export default function CreateProductPage() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      stock: 0,
    },
    mode: "onChange",
  });

  const onSubmit = async (values: CreateProductInput) => {
    try {
      setSubmitting(true);

      // ✅ change URL to your API
      const data = await ProductsApi.create(values);

      toast.success("Product created");
      console.log("Created:", data);

      reset(); // clear form
    } catch (err) {
      toast.error(parseApiError(err));
      console.error("Create product error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toaster richColors />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2.5">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">Add New Product</h2>

          <button
            type="submit"
            disabled={submitting || !isDirty}
            className="flex gap-2 text-xl items-center bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 disabled:opacity-50"
          >
            <PlusIcon /> {submitting ? "Creating..." : "Add product"}
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-8 flex flex-col gap-2">
            <div className="bg-white p-4 rounded-3xl">
              <h4 className="font-bold text-lg">General Information</h4>

              <div className="mt-3">
                <h5>Title</h5>
                <input
                  {...register("title")}
                  type="text"
                  className="w-full border rounded-2xl p-2"
                  placeholder="Product title"
                />
                {errors.title?.message && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="mt-3">
                <h5>Description</h5>
                <textarea
                  {...register("description")}
                  className="w-full border rounded-2xl p-2 min-h-30"
                  placeholder="Optional description"
                />
                {errors.description?.message && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-3xl">
              <h4 className="font-bold text-lg">Price And Stock</h4>

              <div className="flex gap-2 mt-3">
                <div className="flex-1">
                  <h5>Price</h5>
                  <input
                    {...register("price")}
                    type="number"
                    min={0}
                    className="w-full border rounded-2xl p-2"
                  />
                  {errors.price?.message && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <h5>Stock</h5>
                  <input
                    {...register("stock")}
                    type="number"
                    min={0}
                    className="w-full border rounded-2xl p-2"
                  />
                  {errors.stock?.message && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-4 bg-white p-4 rounded-3xl">gg</div>
        </div>
      </form>
    </>
  );
}
