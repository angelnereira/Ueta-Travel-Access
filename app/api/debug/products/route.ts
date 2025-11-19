import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/services/product.service';

export async function GET(request: NextRequest) {
  try {
    const products = await ProductService.getAll({ limit: 20 });

    // Reduce to a safe DTO with only primitives/strings/numbers
    const dto = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name_en: p.name?.en || '',
      price: p.price,
      image: p.image || '',
      category: p.category || '',
      stock: p.stock || 0,
      terminal: p.terminal || ''
    }));

    return new Response(JSON.stringify({ success: true, data: dto, count: dto.length }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    console.error('Debug products error:', err);
    return new Response(JSON.stringify({ success: false, error: err?.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
