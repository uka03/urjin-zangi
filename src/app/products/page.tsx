"use client";
import { ProductsApi } from "@/lib/api/product.api";
import { Product } from "@/types/product.type";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    let ignore = false;

    ProductsApi.listPaged({ page: 1, limit: 20 }).then((res) => {
      if (!ignore && res.success) {
        setItems(res.data.items);
      }
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1>{"\> Products"}</h1>
        <Link
          className="px-4 py-2 bg-black hover:bg-gray-700 rounded-full text-white"
          href={"/products/create"}
        >
          Add product
        </Link>
      </div>
      <div className="flex flex-wrap gap-4">
        {items.map((p) => (
          <div
            key={p.id}
            className="p-3 flex flex-col w-80 bg-white h-100 rounded-3xl "
          >
            <div className="flex-8 bg-gray-400 rounded-xl"></div>
            <div className="flex-4 flex flex-col justify-around p-2">
              <div className="">
                <h2 className="font-bold  text-black">{p.title}</h2>

                <p className="text-sm text-gray-600">{p.description}</p>
              </div>
              <p className="text-sm text-black">Price: {p.price}₮</p>

              <div className="text-sm text-gray-500 text-right">
                {new Date(p.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
