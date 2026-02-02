import { supabase } from '../lib/supabase'
import { Product, DatabaseProduct } from '../types'

export const ProductsService = {
  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(product => this.transformDatabaseProduct(product))
    } catch (error) {
      console.error('Error getting products:', error)
      throw error
    }
  },

  /**
   * Get a specific product by ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return this.transformDatabaseProduct(data)
    } catch (error) {
      console.error('Error getting product:', error)
      throw error
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(product => this.transformDatabaseProduct(product))
    } catch (error) {
      console.error('Error getting products by category:', error)
      throw error
    }
  },

  /**
   * Get golden products
   */
  async getGoldenProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_golden', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(product => this.transformDatabaseProduct(product))
    } catch (error) {
      console.error('Error getting golden products:', error)
      throw error
    }
  },

  /**
   * Get products in stock
   */
  async getInStockProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(product => this.transformDatabaseProduct(product))
    } catch (error) {
      console.error('Error getting in-stock products:', error)
      throw error
    }
  },

  /**
   * Search products by name
   */
  async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(product => this.transformDatabaseProduct(product))
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  },

  /**
   * Create a new product (admin only)
   */
  async createProduct(productData: Omit<DatabaseProduct, 'id' | 'created_at'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error

      return this.transformDatabaseProduct(data)
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  /**
   * Update an existing product (admin only)
   */
  async updateProduct(productId: string, updates: Partial<Omit<DatabaseProduct, 'id' | 'created_at'>>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error

      return this.transformDatabaseProduct(data)
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  /**
   * Delete a product (admin only)
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  /**
   * Update product stock
   */
  async updateStock(productId: string, newStock: number): Promise<Product> {
    try {
      if (newStock < 0) {
        throw new Error('Stock cannot be negative')
      }

      const { data, error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error

      return this.transformDatabaseProduct(data)
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  },

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')

      if (error) throw error

      const categories = [...new Set(data.map(item => item.category))]
      return categories
    } catch (error) {
      console.error('Error getting categories:', error)
      throw error
    }
  },

  /**
   * Get product statistics
   */
  async getProductStatistics() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')

      if (error) throw error

      const stats = {
        total: data.length,
        inStock: data.filter(product => product.stock > 0).length,
        outOfStock: data.filter(product => product.stock === 0).length,
        golden: data.filter(product => product.is_golden).length,
        totalValue: data.reduce((sum, product) => sum + (product.price * product.stock), 0),
        averageRating: data.length > 0 ? data.reduce((sum, product) => sum + product.rating, 0) / data.length : 0,
        categories: [...new Set(data.map(product => product.category))].length
      }

      return stats
    } catch (error) {
      console.error('Error getting product statistics:', error)
      throw error
    }
  },

  /**
   * Transform database product to frontend product interface
   */
  transformDatabaseProduct(dbProduct: DatabaseProduct): Product {
    return {
      id: dbProduct.id,
      name: dbProduct.name,
      category: dbProduct.category,
      price: dbProduct.price,
      image: dbProduct.image,
      stock: dbProduct.stock,
      rating: dbProduct.rating,
      description: dbProduct.description,
      isGolden: dbProduct.is_golden
    }
  }
}