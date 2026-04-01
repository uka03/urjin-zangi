import { ApiResponse, Paginated } from "@/types/api.type";
import { api, qs } from "./clients";
import { Product } from "@/types/product.type";

export const ProductsApi = {
  // A) хэрвээ backend чинь page стандарттай бол
  listPaged(params: { page?: number; limit?: number; q?: string }) {
    return api<ApiResponse<Paginated<Product>>>(`/products${qs(params)}`);
  },

  get(id: string) {
    return api<ApiResponse<Product>>(`/products/${id}`);
  },

  create(body: { title: string; price: number }) {
    return api<ApiResponse<Product>>(`/products`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<Product>) {
    return api<ApiResponse<Product>>(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  remove(id: string) {
    return api<ApiResponse<{ id: string }>>(`/products/${id}`, {
      method: "DELETE",
    });
  },
};
