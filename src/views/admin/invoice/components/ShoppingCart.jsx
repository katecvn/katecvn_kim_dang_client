import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { X, ShoppingCart as CartIcon, Minus, Plus, Package } from 'lucide-react'
import { moneyFormat } from '@/utils/money-format'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const ShoppingCart = ({
  selectedProducts,
  quantities,
  selectedUnitIds,
  priceOverrides,
  discounts,
  selectedTaxes,
  notes,
  giveaway,
  onQuantityChange,
  onUnitChange,
  onPriceChange,
  onDiscountChange,
  onTaxChange,
  onNoteChange,
  onGiveawayChange,
  onRemoveProduct,
  getUnitOptions,
  getDisplayPrice,
  calculateSubTotal,
  calculateTaxForProduct,
}) => {
  if (selectedProducts.length === 0) {
    return (
      <div className="w-[560px] bg-gradient-to-b border-l from-background to-muted/20 flex flex-col relative">
        {/* Left divider */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />
        {/* Right divider */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

        <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
          <h3 className="font-semibold flex items-center gap-2">
            <CartIcon className="h-4 w-4" />
            Giỏ hàng
            <span className="text-xs text-muted-foreground">(0)</span>
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <CartIcon className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Chưa có sản phẩm nào
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click vào sản phẩm để thêm vào giỏ hàng
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[560px] bg-gradient-to-b border-l from-background to-muted/20 flex flex-col relative">
      {/* Left divider */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

      {/* Right divider */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

      {/* Header */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <h3 className="font-semibold flex items-center gap-2">
          <CartIcon className="h-4 w-4" />
          Giỏ hàng
          <span className="text-xs text-muted-foreground">
            ({selectedProducts.length})
          </span>
        </h3>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {selectedProducts.map((product, index) => {
            const unitOptions = getUnitOptions(product)
            const currentUnitId = selectedUnitIds[product.id] || unitOptions[0]?.unitId
            const currentPrice = getDisplayPrice(product)
            const currentQuantity = quantities[product.id] || 1
            const currentDiscount = discounts[product.id] || 0
            const currentGiveaway = giveaway[product.id] || 0
            const subtotal = calculateSubTotal(product.id)
            const taxAmount = calculateTaxForProduct(product.id)
            const total = subtotal + taxAmount
            const productTaxes = product?.prices?.[0]?.taxes || []
            const selectedProductTaxes = selectedTaxes[product.id] || []

            return (
              <div
                key={product.id}
                className="p-3 bg-card rounded-lg border hover:shadow-sm transition-shadow"
              >
                {/* Main Product Row */}
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0 border">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Info & Controls */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Name and Remove Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {product.name}
                        </h4>
                        {product.code && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {product.code}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onRemoveProduct(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Price and Quantity Row */}
                    <div className="flex items-center gap-2">
                      {/* Editable Price */}
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Đơn giá</label>
                        <MoneyInputQuick
                          value={currentPrice}
                          onChange={(num) => onPriceChange(product.id, String(num))}
                          className="h-8 text-sm"
                        />
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex-1">
                        <label className="text-[10px] text-muted-foreground mb-1 block">Số lượng</label>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onQuantityChange(product.id, Math.max(1, currentQuantity - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={currentQuantity}
                            onChange={(e) => onQuantityChange(product.id, Number(e.target.value))}
                            className="h-8 w-14 text-center text-sm p-0"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onQuantityChange(product.id, currentQuantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-muted-foreground">Thành tiền:</span>
                      <span className="text-sm font-semibold text-primary">
                        {moneyFormat(subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Cart Summary */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tạm tính:</span>
          <span className="text-lg font-bold text-primary">
            {moneyFormat(selectedProducts.reduce((total, product) => {
              return total + calculateSubTotal(product.id)
            }, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCart
