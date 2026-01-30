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
import { Plus, Search, LayoutGrid, Edit } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getSuppliers } from '@/stores/SupplierSlice'
import { createPurchaseOrderSchema } from '../schema'
import { updatePurchaseOrder, getPurchaseOrderDetail } from '@/stores/PurchaseOrderSlice'
import { toast } from 'sonner'
import { paymentMethods } from '../../receipt/data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

// Components
import CategorySidebar from '../../invoice/components/CategorySidebar'
import ProductGrid from '../../invoice/components/ProductGrid'
import PurchaseOrderSidebar from './PurchaseOrderSidebar'
import PurchaseOrderCart from './PurchaseOrderCart'
import CreateOtherExpenses from '../../invoice/components/CreateOtherExpenses'
import CreateProductDialog from '../../product/components/CreateProductDialog'

const UpdatePurchaseOrderDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  purchaseOrder,
  purchaseOrderId, // Support passing ID
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
  const [fetchedOrder, setFetchedOrder] = useState(null)

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

  const targetOrder = fetchedOrder || purchaseOrder

  // Fetch Data
  useEffect(() => {
    if (open) {
      dispatch(getProducts())
      dispatch(getSuppliers())
    }
  }, [dispatch, open])

  // Fetch Detail if needed
  useEffect(() => {
    if (open && purchaseOrderId) {
      const fetchDetail = async () => {
        const result = await dispatch(getPurchaseOrderDetail(purchaseOrderId)).unwrap()
        setFetchedOrder(result)
      }
      fetchDetail()
    }
  }, [open, purchaseOrderId, dispatch])


  // POPULATE DATA FOR UPDATE
  useEffect(() => {
    if (open && targetOrder && products.length > 0) {
      // 1. Set Form Values
      form.reset({
        supplierId: targetOrder.supplierId?.toString() || '',
        orderDate: targetOrder.orderDate ? new Date(targetOrder.orderDate) : new Date(),
        status: targetOrder.status || 'draft',
        note: targetOrder.note || '',
        paymentMethod: targetOrder.paymentMethod || 'transfer',
        paymentNote: targetOrder.paymentNote || '',
        contractNumber: targetOrder.externalOrderCode || '',
        paymentTerms: targetOrder.terms || '', // Map terms -> paymentTerms
        expectedDeliveryDate: targetOrder.expectedDeliveryDate ? new Date(targetOrder.expectedDeliveryDate) : null,
      })

      setContractNumber(targetOrder.externalOrderCode || '')
      setExpectedDeliveryDate(targetOrder.expectedDeliveryDate ? new Date(targetOrder.expectedDeliveryDate) : null)

      // 2. Set Supplier
      if (targetOrder.supplier) {
        setSelectedSupplier(targetOrder.supplier)
        setSupplierEditData({
          name: targetOrder.supplier.name,
          phone: targetOrder.supplier.phone,
          email: targetOrder.supplier.email,
          address: targetOrder.supplier.address,
          taxCode: targetOrder.supplier.taxCode,
        })
      }

      // 3. Set Items
      const items = targetOrder.items || []
      const productList = []
      const nextQuantities = {}
      const nextUnitIds = {}
      const nextPriceOverrides = {}
      const nextDiscounts = {}
      const nextNotes = {}
      const nextTaxes = {}
      const nextBasePrices = {}

      items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          productList.push(product)
          const pid = product.id

          nextQuantities[pid] = item.quantity
          nextUnitIds[pid] = item.unitId
          nextDiscounts[pid] = item.discount || 0
          nextNotes[pid] = item.note || ''
          nextPriceOverrides[pid] = item.unitPrice // Unit Price in item is the final price

          // Reconstruct taxes if possible
          if (item.taxAmount > 0 && product.prices?.[0]?.taxes?.length > 0) {
            // See previous notes. Leaving empty for now as requested.
          }

          nextBasePrices[pid] = product.price // Default base price
        }
      })

      setSelectedProducts(productList)
      setQuantities(nextQuantities)
      setSelectedUnitIds(nextUnitIds)
      setPriceOverrides(nextPriceOverrides)
      setDiscounts(nextDiscounts)
      setNotes(nextNotes)
      setBaseUnitPrices(nextBasePrices) // Important for calculation
      // setSelectedTaxes(nextTaxes) 

      // 4. Other Expenses
      setOtherExpenses({
        price: targetOrder.otherCosts || 0,
        description: '', // Desc not in top level PO?
      })

    }
  }, [open, targetOrder, products, form]) // Dependencies matter here

  // Reset States on Close (only if no purchaseOrder to prevent clearing during edit if logic changes)
  // But here we want to clear when dialog closes usually.
  useEffect(() => {
    if (open) return
    // Cleanup
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
    setFetchedOrder(null) // Reset fetched
    form.reset()
  }, [open, form])


  // ====== CATEGORY LOGIC ======
  // (Same as Create)
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
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => (p.categoryId || 'uncategorized') === selectedCategory)
    }
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
  // (Same as Create)
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
  // (Same as Create)
  const handleAddProduct = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)
    if (isAlreadySelected) {
      handleRemoveProduct(product.id)
    } else {
      setSelectedProducts(prev => [...prev, product])
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
    const subTotal = calculateSubTotal()
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
        subTotal: calculateSubTotal(product.id), // Subtotal after discount
        discount: discounts[product.id] || 0,
        total: calculateSubTotal(product.id) + calculateTaxForProduct(product.id),
        note: notes[product.id] || '',
      }
    })

    const formattedDate = expectedDeliveryDate
      ? (expectedDeliveryDate instanceof Date ? expectedDeliveryDate.toISOString().split('T')[0] : expectedDeliveryDate)
      : (data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : null)

    const dataToSend = {
      purchaseOrderId: targetOrder.id, // ID for update URL
      supplierId: data.supplierId || targetOrder.supplierId,
      orderDate: data.orderDate ? new Date(data.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: formattedDate,
      // expectedReturnDate: formattedDate, // Optional/Extra?
      externalOrderCode: contractNumber,
      terms: data.paymentTerms,
      otherCosts: otherExpenses.price,

      note: data.note,
      // taxAmount: calculateTotalTax(), // Remove calculated fields from root
      // amount: calculateTotalAmount(),
      // discount: calculateTotalDiscount(),
      // subTotal: handleCalculateSubTotalInvoice(),
      // totalAmount: calculateTotalAmount(),
      status: data.status,
      // paymentStatus: targetOrder.paymentStatus, // Don't change payment status silently
      items: items.map(item => ({
        productId: item.productId,
        unitId: item.unitId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        note: item.note
      })),
      paymentMethod: data.paymentMethod,
      paymentNote: data.paymentNote,
      // paymentTerms: data.paymentTerms, // Use 'terms' as per requirement
      updatedBy: authUserWithRoleHasPermissions.id,

      // Allow new supplier creation on update if user really wants to switch?
      // Usually update PO might just fix details. But logic supports it.
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
      // NOTE: Using update action
      await dispatch(updatePurchaseOrder(dataToSend)).unwrap()
      toast.success('Cập nhật đơn hàng thành công')

      form.reset()
      onOpenChange?.(false)

    } catch (error) {
      console.log('Update error:', error)
      toast.error('Có lỗi xảy ra khi cập nhật đơn hàng')
    }
  }

  // Mobile rendering and other effects... same as Create
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

  if (!isDesktop && open) {
    // Simplified Mobile View for Update - could be full copy of Create logic
    // For brevity, cloning the internal logic
    return (
      <div className="fixed inset-0 top-14 bottom-16 bg-background z-40 flex flex-col pt-0">
        {/* Mobile Header, Form Content etc. 
             If exact same as create, we can just use the exact code.
             I will just copy the Desktop structure primarily as requested by prompt "Create Update... similar to Create..."
             Mobile support is good to have. I'll include the standard layout. 
         */}
        <div className="px-4 py-3 border-b flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            {mobileView === 'cart' && (
              <Button type="button" variant="ghost" size="icon" onClick={() => setMobileView('products')}>
                <LayoutGrid className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h2 className="text-lg font-semibold">{mobileView === 'products' ? 'Chọn sản phẩm' : 'Đơn hàng'}</h2>
              <p className="text-xs text-muted-foreground">{mobileView === 'products' ? `${selectedProducts.length} sản phẩm` : 'Cập nhật đơn hàng'}</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)}><Plus className="h-5 w-5 rotate-45" /></Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            {mobileView === 'products' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search */}
                <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                  <Input placeholder="Tìm kiếm sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex-1 flex flex-col overflow-hidden w-full">
                  <div className="flex-1 overflow-y-auto w-full">
                    <ProductGrid products={filteredProducts} onAddProduct={handleAddProduct} selectedProductIds={selectedProducts.map(p => p.id)} loading={false} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
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
                <div className="border-t">
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
                    isUpdate={true}
                    isPrintContract={isPrintContract}
                    setIsPrintContract={setIsPrintContract}
                    contractNumber={contractNumber}
                    setContractNumber={setContractNumber}
                    otherExpenses={otherExpenses}
                    calculateExpenses={calculateExpenses}
                    onEditExpenses={() => setShowOtherExpenses(true)}
                  />
                </div>
              </div>
            )}
          </form>
        </Form>
      </div>
    )
  }

  if (!isDesktop && open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={isDesktop} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <Edit className="mr-2 size-4" aria-hidden="true" />
            Cập nhật
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-screen w-screen p-0 m-0 h-[calc(100vh-64px)] md:max-h-screen md:h-screen">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle>Cập nhật đơn đặt hàng</DialogTitle>
          <DialogDescription>Chỉnh sửa thông tin đơn đặt hàng</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden border-t">
            <div className="flex flex-1 overflow-hidden">
              <div className="flex flex-col flex-1">
                <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm kiếm sản phẩm..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <div className="ml-auto">
                  <Button size="sm" variant="default" className="h-7 text-xs shadow-md" onClick={(e) => { e.preventDefault(); setShowCreateProduct(true) }}>
                    <Plus className="h-3 w-3 mr-1" /> Thêm sản phẩm
                  </Button>
                </div>
                <div className="flex flex-1 overflow-hidden">
                  <CategorySidebar categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} productCounts={productCounts} />
                  <ProductGrid products={filteredProducts} onAddProduct={handleAddProduct} selectedProductIds={selectedProducts.map(p => p.id)} loading={false} />
                </div>
              </div>

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
                isUpdate={true}
                isPrintContract={isPrintContract}
                setIsPrintContract={setIsPrintContract}
                contractNumber={contractNumber}
                setContractNumber={setContractNumber}
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

export default UpdatePurchaseOrderDialog
