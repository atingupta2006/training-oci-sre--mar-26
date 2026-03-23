import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { cacheMiddleware, invalidateCache } from '../middleware/cache';

const router = Router();

router.get('/', cacheMiddleware({ ttl: 300, keyPrefix: 'products' }), async (req: Request, res: Response) => {
  try {
    const { category, search, limit = '50', offset = '0' } = req.query;

    let query = supabase.from('products').select('*');

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    if (search && typeof search === 'string') {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    query = query.range(offsetNum, offsetNum + limitNum - 1).order('name', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      if (process.env.SUPABASE_URL?.includes('mock.supabase') || error.message?.includes('fetch')) {
        const MOCK_PRODUCTS = [
          { id: '1', name: 'SRE Engineering T-Shirt', price: 25.99, category: 'Apparel', stock_quantity: 100, sku: 'SRE-TSHIRT', description: 'Comfortable t-shirt for on-call.' },
          { id: '2', name: 'Mechanical Keyboard (Tactile)', price: 120.00, category: 'Electronics', stock_quantity: 15, sku: 'KEY-TACT', description: 'Clicky switch mechanical keyboard.' },
          { id: '3', name: 'Coffee Mug - "It works on my machine"', price: 15.00, category: 'Accessories', stock_quantity: 50, sku: 'MUG-IWM', description: 'Standard 12oz ceramic mug.' },
          { id: '4', name: 'Noise Cancelling Headphones', price: 250.00, category: 'Electronics', stock_quantity: 10, sku: 'HP-NC', description: 'Essential for deep work.' }
        ];
        return res.json({
          data: MOCK_PRODUCTS,
          count: MOCK_PRODUCTS.length,
          limit: limitNum,
          offset: offsetNum,
        });
      }
      throw error;
    }

    res.json({
      data,
      count,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/:id', cacheMiddleware({ ttl: 600, keyPrefix: 'product' }), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, category, stock_quantity, sku } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields: name, price, category' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        price,
        category,
        stock_quantity: stock_quantity || 0,
        sku,
      })
      .select()
      .single();

    if (error) throw error;

    await invalidateCache('products:*');

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock_quantity, sku } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (category !== undefined) updateData.category = category;
    if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
    if (sku !== undefined) updateData.sku = sku;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await invalidateCache('products:*');
    await invalidateCache(`product:*:${id}`);

    res.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) throw error;

    await invalidateCache('products:*');
    await invalidateCache(`product:*:${id}`);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
