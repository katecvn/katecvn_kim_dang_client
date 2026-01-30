import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search, ShoppingCart as CartIcon, LayoutGrid } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getSuppliers } from '@/stores/SupplierSlice'
import { createPurchaseOrderSchema } from '../schema'
import { createPurchaseOrder } from '@/stores/PurchaseOrderSlice'
import { toast } from 'sonner'
import { paymentMethods } from '../../receipt/data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

// Components
import CategorySidebar from '../../invoice/components/CategorySidebar'
import ProductGrid from '../../invoice/components/ProductGrid'
import PurchaseOrderSidebar from './PurchaseOrderSidebar'
import PurchaseOrderCart from './PurchaseOrderCart'
import CreateOtherExpenses from '../../invoice/components/CreateOtherExpenses'
import { attributes, productTypeMap } from '../data'
import PurchaseContractPreviewDialog from './PurchaseContractPreviewDialog'
import { buildPurchaseContractData } from '../helpers/BuildPurchaseContractData'
import CreateProductDialog from '../../product/components/CreateProductDialog'

const CreatePurchaseOrderDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const suppliers = useSelector((state) => state.supplier.suppliers)
  const loading = useSelector((state) => state.purchaseOrder.loading)
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}

  const isDesktop = useMediaQuery('(min-width: 768px)')

  // UI States
  const [mobileView, setMobileView] = useState('products') // 'products' | 'cart'
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])

  // Data States
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierEditData, setSupplierEditData] = useState(null)

  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedUnitIds, setSelectedUnitIds] = useState({})
  const [baseUnitPrices, setBaseUnitPrices] = useState({})
  const [priceOverrides, setPriceOverrides] = useState({})
  const [discounts, setDiscounts] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState({})
  const [selectedTaxes, setSelectedTaxes] = useState({})

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(null)

  // Other Expenses
  const [showOtherExpenses, setShowOtherExpenses] = useState(false)
  const [otherExpenses, setOtherExpenses] = useState({
    price: 0,
    description: '',
  })

  // Contract Printing
  const [isPrintContract, setIsPrintContract] = useState(false)
  const [contractNumber, setContractNumber] = useState('')
  const [showContractPreview, setShowContractPreview] = useState(false)
  const [contractPreviewData, setContractPreviewData] = useState(null)

  // Create Product Dialog State
  const [showCreateProduct, setShowCreateProduct] = useState(false)

  const form = useForm({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      orderDate: new Date(),
      status: 'draft',
      note: '',
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
      contractNumber: '',
      paymentTerms: '',
      expectedDeliveryDate: null,
    },
  })

  // Fetch Data
  useEffect(() => {
    if (open) {
      dispatch(getProducts())
      dispatch(getSuppliers())
    }
  }, [dispatch, open])

  // Reset States on Close
  useEffect(() => {
    if (open) return
    setSelectedProducts([])
    setSelectedUnitIds({})
    setBaseUnitPrices({})
    setPriceOverrides({})
    setDiscounts({})
    setQuantities({})
    setNotes({})
    setSelectedTaxes({})
    setSelectedSupplier(null)
    setSupplierEditData(null)
    setExpectedDeliveryDate(null)
    setSearchQuery('')
    setSelectedCategory('all')
    setMobileView('products')
    setIsPrintContract(false)
    setContractNumber('')
    setShowContractPreview(false)
    setContractPreviewData(null)
    form.reset()
  }, [open, form])

  // ====== CATEGORY LOGIC ======
  const categories = useMemo(() => {
    if (!products || products.length === 0) return []
    const categoryMap = new Map()
    products.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized'
      const categoryName = product.category?.name || 'Chưa phân loại'
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          icon: product.category?.icon,
          count: 0
        })
      }
      const category = categoryMap.get(categoryId)
      category.count++
    })
    return Array.from(categoryMap.values())
  }, [products])

  const productCounts = useMemo(() => {
    const counts = {}
    products.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized'
      counts[categoryId] = (counts[categoryId] || 0) + 1
    })
    return counts
  }, [products])

  // ====== PRODUCT FILTERING ======
  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => (p.categoryId || 'uncategorized') === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, products, searchQuery])


  // ====== UNIT HELPERS ======
  const getBaseUnitId = (product) =>
    product?.baseUnitId || product?.prices?.[0]?.unitId || null

  const getBaseUnitName = (product) =>
    product?.baseUnit?.name || product?.prices?.[0]?.unitName || '—'

  const getUnitOptions = useCallback((product) => {
    const baseId = getBaseUnitId(product)
    const baseName = getBaseUnitName(product)
    const options = []
    if (baseId) {
      options.push({ unitId: Number(baseId), unitName: baseName, factor: 1 })
    }
    const conversions = Array.isArray(product?.unitConversions)
      ? product.unitConversions
      : []
    for (const c of conversions) {
      const uId = Number(c?.unitId)
      if (!uId) continue
      const factor = Number(c?.conversionFactor || 0)
      options.push({
        unitId: uId,
        unitName: c?.unit?.name || '—',
        factor: factor > 0 ? factor : 1,
      })
    }
    const map = new Map()
    for (const o of options) {
      if (!map.has(o.unitId)) map.set(o.unitId, o)
    }
    return Array.from(map.values())
  }, [])

  const getFactor = useCallback(
    (product, unitId) => {
      const uId = Number(unitId)
      if (!uId) return 1
      const opt = getUnitOptions(product).find((o) => Number(o.unitId) === uId)
      return opt?.factor && opt.factor > 0 ? opt.factor : 1
    },
    [getUnitOptions],
  )

  const getUnitNameById = useCallback(
    (product, unitId) => {
      const uId = Number(unitId)
      const opt = getUnitOptions(product).find((o) => Number(o.unitId) === uId)
      return opt?.unitName || getBaseUnitName(product)
    },
    [getUnitOptions],
  )

  const getDisplayPrice = useCallback(
    (product) => {
      const pid = product?.id
      if (!pid) return 0
      const unitId =
        selectedUnitIds[pid] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const factor = getFactor(product, unitId)

      if (priceOverrides[pid] != null) return Number(priceOverrides[pid] || 0)

      const basePrice = Number(baseUnitPrices[pid] ?? product?.price ?? 0)
      return factor > 0 ? basePrice / factor : basePrice
    },
    [baseUnitPrices, priceOverrides, selectedUnitIds, getFactor],
  )


  // ====== HANDLERS ======
  const handleAddProduct = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)

    if (isAlreadySelected) {
      handleRemoveProduct(product.id)
    } else {
      setSelectedProducts(prev => [...prev, product])
      // Initialize states
      setQuantities(prev => ({ ...prev, [product.id]: 1 }))
      setBaseUnitPrices(prev => ({ ...prev, [product.id]: product.price }))

      const defaultUnit = getBaseUnitId(product) || product?.prices?.[0]?.unitId
      if (defaultUnit) {
        setSelectedUnitIds(prev => ({ ...prev, [product.id]: defaultUnit }))
      }
    }
  }

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))

    // Cleanup
    const cleanup = (setter) => {
      setter(prev => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
    }

    cleanup(setSelectedUnitIds)
    cleanup(setBaseUnitPrices)
    cleanup(setPriceOverrides)
    cleanup(setDiscounts)
    cleanup(setQuantities)
    cleanup(setNotes)
    cleanup(setSelectedTaxes)
  }

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    if (supplier) {
      form.setValue('supplierId', supplier.id.toString())
      setSupplierEditData({
        name: supplier.name,
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        taxCode: supplier.taxCode || '',
      })
    } else {
      form.setValue('supplierId', '')
      setSupplierEditData(null)
    }
  }

  const handleUnitChange = (productId, unitId) => {
    setSelectedUnitIds(prev => ({ ...prev, [productId]: Number(unitId) }))
    setPriceOverrides(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({ ...prev, [productId]: Number(value) }))
  }

  const handlePriceChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setPriceOverrides(prev => ({ ...prev, [productId]: numericValue }))
  }

  const handleDiscountChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setDiscounts(prev => ({ ...prev, [productId]: numericValue }))
  }

  const handleNoteChange = (productId, value) => {
    setNotes(prev => ({ ...prev, [productId]: value }))
  }

  const handleTaxChange = (productId, taxId, isChecked) => {
    setSelectedTaxes((prev) => {
      const productTaxes = prev[productId] || []
      return {
        ...prev,
        [productId]: isChecked
          ? [...productTaxes, taxId]
          : productTaxes.filter((id) => id !== taxId),
      }
    })
  }

  // ====== CALCULATIONS ======
  const calculateSubTotal = (productId) => {
    if (!productId) {
      // Calculate Total Subtotal of ALL products
      return selectedProducts.reduce((sum, p) => sum + calculateSubTotal(p.id), 0)
    }

    const quantity = quantities[productId] || 1
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0
    const discount = discounts[productId] || 0
    const price = getDisplayPrice(product)
    const subtotal = quantity * price
    return subtotal - discount > 0 ? subtotal - discount : 0
  }

  const calculateTaxForProduct = (productId) => {
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0
    const quantity = quantities[productId] || 1
    const price = getDisplayPrice(product)
    const basePrice = price * quantity
    const selectedProductTaxes = selectedTaxes[productId] || []
    const taxes = product?.prices?.[0]?.taxes || []

    return taxes
      .filter((tax) => selectedProductTaxes.includes(tax.id))
      .reduce((sum, tax) => sum + (basePrice * tax.percentage) / 100, 0)
  }

  const calculateTotalTax = () => {
    return selectedProducts.reduce((sum, p) => sum + calculateTaxForProduct(p.id), 0)
  }

  const calculateTotalDiscount = () => {
    return selectedProducts.reduce((sum, p) => sum + (discounts[p.id] || 0), 0)
  }

  const handleCalculateSubTotalInvoice = () => {
    return selectedProducts.reduce((subTotal, product) => {
      const price = getDisplayPrice(product)
      const quantity = quantities[product.id] || 1
      const total = price * quantity
      return subTotal + total
    }, 0)
  }

  const calculateTotalAmount = () => {
    const subTotal = calculateSubTotal() // This is actually Total Subtotal after discount
    const tax = calculateTotalTax()
    const expenses = calculateExpenses()
    return subTotal + tax + expenses
  }

  const handleSetOtherExpenses = (data) => {
    setOtherExpenses(data)
  }

  const calculateExpenses = () => {
    const totalExpenses = otherExpenses.price
    return totalExpenses
  }


  // ====== SUBMIT ======
  const onSubmit = async (data) => {
    // Validations
    if (selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm')
      return
    }

    if (!data.supplierId && (!supplierEditData?.name || !supplierEditData?.phone)) {
      toast.error('Vui lòng chọn nhà cung cấp hoặc nhập tên và số điện thoại cho nhà cung cấp mới')
      return
    }

    const items = selectedProducts.map((product, index) => {
      const unitId =
        selectedUnitIds[product.id] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const unitName = getUnitNameById(product, unitId)
      const factor = getFactor(product, unitId)
      const qtyUnit = quantities[product.id] || 1
      const qtyBase = factor > 0 ? qtyUnit / factor : qtyUnit
      const priceUnit = getDisplayPrice(product)

      return {
        lineNo: index + 1,
        productId: product.id,
        productCode: product.code || '',
        image: product.image,
        productName: product.name,
        productType: product.type,
        unitId,
        unitName,
        quantity: qtyUnit,
        receivedQuantity: 0,
        baseQuantity: qtyBase,
        conversionFactor: factor,
        unitPrice: priceUnit,
        taxAmount: calculateTaxForProduct(product.id),
        subTotal: calculateSubTotal(product.id),
        discount: discounts[product.id] || 0,
        total: calculateSubTotal(product.id) + calculateTaxForProduct(product.id),
        note: notes[product.id] || '',
      }
    })

    const formattedDate = expectedDeliveryDate
      ? (expectedDeliveryDate instanceof Date ? expectedDeliveryDate.toISOString().split('T')[0] : expectedDeliveryDate)
      : (data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : null)

    const dataToSend = {
      supplierId: data.supplierId || null,
      orderDate: data.orderDate ? new Date(data.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: formattedDate, // Ngày nhận hàng
      expectedReturnDate: formattedDate,   // [MỚI] Ngày trả vỏ/két (Map theo yêu cầu user)
      externalOrderCode: contractNumber,   // [MỚI] Mã đơn bên NCC (Số hợp đồng)
      terms: data.paymentTerms,            // [MỚI] Điều khoản
      otherCosts: otherExpenses.price,     // [MỚI] Chi phí khác
      isPrintContract: true,               // [MỚI] Luôn in hợp đồng

      note: data.note,
      taxAmount: calculateTotalTax(),
      amount: calculateTotalAmount(), // Total amount
      discount: calculateTotalDiscount(),
      subTotal: handleCalculateSubTotalInvoice(), // Gross Subtotal
      totalAmount: calculateTotalAmount(),
      status: data.status,
      paymentStatus: 'unpaid',
      paidAmount: 0,
      items,
      paymentMethod: data.paymentMethod,
      paymentNote: data.paymentNote,
      paymentTerms: data.paymentTerms, // Keep for backward compatibility if needed
      createdBy: authUserWithRoleHasPermissions.id,
      updatedBy: authUserWithRoleHasPermissions.id,

      // New Supplier Data
      ...((!data.supplierId && supplierEditData) && {
        newSupplier: {
          name: supplierEditData.name,
          phone: supplierEditData.phone,
          email: supplierEditData.email || '',
          address: supplierEditData.address || '',
          taxCode: supplierEditData.taxCode || '',
        }
      })
    }

    try {
      const newOrder = await dispatch(createPurchaseOrder(dataToSend)).unwrap()
      toast.success('Tạo đơn hàng thành công')

      // Luôn hiển thị xem trước hợp đồng (theo yêu cầu bỏ điều kiện isPrintContract)
      // Prepare data for preview
      const fullOrderData = {
        ...newOrder,
        // If new supplier was created inline, the response 'newOrder' should have it populated
        // but we fallback to local state just in case for immediate preview
        supplier: newOrder.supplier || selectedSupplier || (supplierEditData ? { ...supplierEditData, name: supplierEditData.name } : {}),
        items: items
      }

      const contract = buildPurchaseContractData(fullOrderData, contractNumber)
      setContractPreviewData(contract)
      setShowContractPreview(true)

    } catch (error) {
      console.log('Submit error:', error)
      toast.error('Có lỗi xảy ra khi tạo đơn hàng')
    }
  }

  // Expose dialog state to window for mobile navigation
  useEffect(() => {
    if (!isDesktop && open) {
      window.__purchaseOrderDialog = {
        setMobileView,
        selectedProductsCount: selectedProducts.length,
        currentView: mobileView,
      }
    }
    return () => {
      delete window.__purchaseOrderDialog
    }
  }, [isDesktop, open, setMobileView, selectedProducts.length, mobileView])

  // Mobile: Render as full page
  if (!isDesktop && open) {
    return (
      <>
        <div className="fixed inset-0 top-14 bottom-16 bg-background z-40 flex flex-col pt-0">
          {/* Mobile Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between bg-background">
            <div className="flex items-center gap-2">
              {mobileView === 'cart' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileView('products')}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  {mobileView === 'products' ? 'Chọn sản phẩm' : 'Đơn hàng'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mobileView === 'products'
                    ? `${selectedProducts.length} sản phẩm đã chọn`
                    : 'Hoàn tất đơn hàng'
                  }
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <Plus className="h-5 w-5 rotate-45" />
            </Button>
          </div>

          {/* Form Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
              {mobileView === 'products' ? (
                /* View 1: Product Selection */
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Search Bar */}
                  <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm sản phẩm..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Hiển thị {filteredProducts.length} / {products.length} sản phẩm
                    </div>
                  </div>

                  {/* Category + Product Grid */}
                  <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
                    {/* Category Sidebar - Horizontal scroll with filter */}
                    <div className="border-b p-2 flex items-center gap-2">
                      <div className="flex-1 overflow-x-auto">
                        <div className="flex gap-2">
                          {/* All Categories Option */}
                          <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all",
                              selectedCategory === 'all'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            Tất cả
                          </button>

                          {categories.map((category) => {
                            const isActive = selectedCategory === category.id
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.id)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all",
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {category.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Product Grid - Vertical scroll */}
                    <div className="flex-1 overflow-y-auto min-w-0 w-full">
                      <ProductGrid
                        products={filteredProducts}
                        onAddProduct={handleAddProduct}
                        selectedProductIds={selectedProducts.map(p => p.id)}
                        loading={false}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View 2: Cart & Checkout */
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col">
                    {/* Shopping Cart */}
                    <div className="[&>div]:!w-full [&>div]:border-0 [&>div]:!bg-transparent [&>div]:shadow-none">
                      <PurchaseOrderCart
                        selectedProducts={selectedProducts}
                        quantities={quantities}
                        selectedUnitIds={selectedUnitIds}
                        priceOverrides={priceOverrides}
                        discounts={discounts}
                        selectedTaxes={selectedTaxes}
                        notes={notes}
                        onQuantityChange={handleQuantityChange}
                        onUnitChange={handleUnitChange}
                        onPriceChange={handlePriceChange}
                        onDiscountChange={handleDiscountChange}
                        onTaxChange={handleTaxChange}
                        onNoteChange={handleNoteChange}
                        onRemoveProduct={handleRemoveProduct}
                        getUnitOptions={getUnitOptions}
                        getDisplayPrice={getDisplayPrice}
                        calculateSubTotal={calculateSubTotal}
                        calculateTaxForProduct={calculateTaxForProduct}
                      />
                    </div>

                    {/* Sidebar */}
                    <div className="border-t [&>div]:!w-full [&>div]:!max-w-full">
                      <PurchaseOrderSidebar
                        form={form}
                        suppliers={suppliers}
                        selectedSupplier={selectedSupplier}
                        supplierEditData={supplierEditData}
                        onSupplierEditDataChange={setSupplierEditData}
                        onSelectSupplier={handleSelectSupplier}
                        paymentMethods={paymentMethods}
                        calculateSubTotal={calculateSubTotal}
                        calculateTotalTax={calculateTotalTax}
                        calculateTotalDiscount={calculateTotalDiscount}
                        calculateTotalAmount={calculateTotalAmount}
                        onSubmit={onSubmit}
                        loading={loading}
                        expectedDeliveryDate={expectedDeliveryDate}
                        onExpectedDeliveryDateChange={setExpectedDeliveryDate}
                        isPrintContract={isPrintContract}
                        setIsPrintContract={setIsPrintContract}
                        contractNumber={contractNumber}
                        setContractNumber={setContractNumber}
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      </>
    )
  }

  // Don't render desktop dialog on mobile to prevent state loss
  if (!isDesktop) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={isDesktop} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-screen w-screen p-0 m-0 h-[calc(100vh-64px)] md:max-h-screen md:h-screen">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle>Tạo đơn đặt hàng mới</DialogTitle>
          <DialogDescription>Chọn sản phẩm và điền thông tin để tạo đơn đặt hàng</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden border-t">
            {/* 4-COLUMN LAYOUT */}
            <div className="flex flex-1 overflow-hidden">
              {/* LEFT SECTION: Category + Products */}
              <div className="flex flex-col flex-1">
                {/* UNIFIED SEARCH BAR spanning columns 1 & 2 */}
                <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Hiển thị {filteredProducts.length} / {products.length} sản phẩm
                  </div>
                </div>

                {/* Add Product Button */}
                <div className="ml-auto">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowCreateProduct(true)
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Thêm sản phẩm
                  </Button>
                </div>

                {/* Category + Product Grid Row */}
                <div className="flex flex-1 overflow-hidden">
                  {/* COLUMN 1: Category Sidebar */}
                  <CategorySidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    productCounts={productCounts}
                  />


                  <ProductGrid
                    products={filteredProducts}
                    onAddProduct={handleAddProduct}
                    selectedProductIds={selectedProducts.map(p => p.id)}
                    loading={false}
                  />
                </div>
              </div>

              {/* COLUMN 3: Shopping Cart */}
              <PurchaseOrderCart
                selectedProducts={selectedProducts}
                quantities={quantities}
                selectedUnitIds={selectedUnitIds}
                priceOverrides={priceOverrides}
                discounts={discounts}
                selectedTaxes={selectedTaxes}
                notes={notes}
                onQuantityChange={handleQuantityChange}
                onUnitChange={handleUnitChange}
                onPriceChange={handlePriceChange}
                onDiscountChange={handleDiscountChange}
                onTaxChange={handleTaxChange}
                onNoteChange={handleNoteChange}
                onRemoveProduct={handleRemoveProduct}
                getUnitOptions={getUnitOptions}
                getDisplayPrice={getDisplayPrice}
                calculateSubTotal={calculateSubTotal}
                calculateTaxForProduct={calculateTaxForProduct}
              />

              {/* COLUMN 4: Sidebar */}
              <PurchaseOrderSidebar
                form={form}
                suppliers={suppliers}
                selectedSupplier={selectedSupplier}
                supplierEditData={supplierEditData}
                onSupplierEditDataChange={setSupplierEditData}
                onSelectSupplier={handleSelectSupplier}
                paymentMethods={paymentMethods}
                calculateSubTotal={calculateSubTotal}
                calculateTotalTax={calculateTotalTax}
                calculateTotalDiscount={calculateTotalDiscount}
                calculateTotalAmount={calculateTotalAmount}
                onSubmit={onSubmit}
                loading={loading}
                expectedDeliveryDate={expectedDeliveryDate}
                onExpectedDeliveryDateChange={setExpectedDeliveryDate}
                isPrintContract={isPrintContract}
                setIsPrintContract={setIsPrintContract}
                contractNumber={contractNumber}
                setContractNumber={setContractNumber}
                // Expenses
                otherExpenses={otherExpenses}
                calculateExpenses={calculateExpenses}
                onEditExpenses={() => setShowOtherExpenses(true)}
              />
            </div>
          </form>
        </Form>
      </DialogContent>

      <CreateOtherExpenses
        open={showOtherExpenses}
        onOpenChange={setShowOtherExpenses}
        setOtherExpenses={handleSetOtherExpenses}
        otherExpenses={otherExpenses}
        showTrigger={false}
      />

      {/* Contract Preview Dialog */}
      <PurchaseContractPreviewDialog
        open={showContractPreview}
        onOpenChange={(open) => {
          setShowContractPreview(open)
          if (!open) {
            // If closing preview, close the main dialog too as order is done
            onOpenChange?.(false)
            form.reset()
          }
        }}
        initialData={contractPreviewData}
        contentClassName="z-[10006]"
        overlayClassName="z-[10005]"
      />

      <CreateProductDialog
        open={showCreateProduct}
        onOpenChange={setShowCreateProduct}
        onSuccess={() => {
          dispatch(getProducts())
          setShowCreateProduct(false)
          toast.success('Đã thêm sản phẩm mới')
        }}
        showTrigger={false}
        contentClassName="z-[10006]"
        overlayClassName="z-[10005]"
      />
    </Dialog>
  )
}

export default CreatePurchaseOrderDialog