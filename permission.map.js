/**
 * ============================================================================================
 * HỆ THỐNG PHÂN QUYỀN - SINGLE SOURCE OF TRUTH
 * ============================================================================================
 *
 * File này là nguồn dữ liệu duy nhất cho hệ thống phân quyền.
 * Cấu trúc được tổ chức theo Menu Frontend để dễ dàng hiển thị và quản lý.
 * 
 * NAMING CONVENTION:
 * - VIEW/GET: "Xem [danh sách] {Đối tượng}"
 * - CREATE: "Tạo {Đối tượng}"
 * - UPDATE: "Cập nhật {Đối tượng}"
 * - DELETE: "Xóa {Đối tượng}"
 * - APPROVE: "Duyệt {Đối tượng}"
 * - CANCEL: "Hủy {Đối tượng}"
 * 
 * Tên đối tượng luôn ở dạng SỐ ÍT và CỤ THỂ (hóa đơn, khách hàng, sản phẩm)
 * KHÔNG dùng từ chung chung như "danh mục", "đối tượng"
 */

const { PERMISSION } = require('../../enums/permission-enum')

module.exports = {
    // ============================================================================================
    // 1. TỔNG QUAN (OVERVIEW/DASHBOARD)
    // ============================================================================================
    OVERVIEW: {
        label: "Tổng quan",
        items: {
            DASHBOARD: {
                label: "Tổng quan",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_REPORT,
                        name: "Xem tổng quan"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 2. BÁN HÀNG (SALES)
    // ============================================================================================
    SALES: {
        label: "Bán hàng",
        items: {
            INVOICE: {
                label: "Hóa đơn bán hàng",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.GET_INVOICE,
                        name: "Xem tất cả hóa đơn"
                    },
                    VIEW_OWN: {
                        code: PERMISSION.GET_INVOICE_USER,
                        name: "Xem hóa đơn của tôi"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_INVOICE,
                        name: "Tạo hóa đơn"
                    },
                    APPROVE: {
                        code: PERMISSION.APPROVE_INVOICE,
                        name: "Duyệt hóa đơn"
                    },
                    REJECT: {
                        code: PERMISSION.REJECT_INVOICE,
                        name: "Từ chối hóa đơn"
                    },
                    REVERT: {
                        code: PERMISSION.REVERT_INVOICE,
                        name: "Hoàn tác hóa đơn"
                    },
                    DELETE_ALL: {
                        code: PERMISSION.DELETE_INVOICE,
                        name: "Xóa hóa đơn"
                    },
                    DELETE_OWN: {
                        code: PERMISSION.DELETE_INVOICE_USER,
                        name: "Xóa hóa đơn của tôi"
                    }
                }
            },
            SALES_CONTRACT: {
                label: "Hợp đồng bán hàng",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.SALES_CONTRACT_VIEW_ALL,
                        name: "Xem tất cả hợp đồng bán"
                    },
                    CREATE: {
                        code: PERMISSION.SALES_CONTRACT_CREATE,
                        name: "Tạo hợp đồng bán"
                    },
                    UPDATE: {
                        code: PERMISSION.SALES_CONTRACT_UPDATE,
                        name: "Cập nhật hợp đồng bán"
                    },
                    DELETE: {
                        code: PERMISSION.SALES_CONTRACT_DELETE,
                        name: "Xóa hợp đồng bán"
                    },
                    APPROVE: {
                        code: PERMISSION.SALES_CONTRACT_APPROVE,
                        name: "Duyệt hợp đồng bán"
                    },
                    CANCEL: {
                        code: PERMISSION.SALES_CONTRACT_CANCEL,
                        name: "Hủy hợp đồng bán"
                    },
                    LIQUIDATE: {
                        code: PERMISSION.SALES_CONTRACT_LIQUIDATE,
                        name: "Thanh lý hợp đồng bán"
                    }
                }
            },
            RECEIPT: {
                label: "Phiếu thu",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.RECEIPT_VIEW_ALL,
                        name: "Xem tất cả phiếu thu"
                    },
                    VIEW_OWN: {
                        code: PERMISSION.RECEIPT_VIEW_OWN,
                        name: "Xem phiếu thu của tôi"
                    },
                    CREATE: {
                        code: PERMISSION.RECEIPT_CREATE,
                        name: "Tạo phiếu thu"
                    },
                    UPDATE: {
                        code: PERMISSION.RECEIPT_UPDATE,
                        name: "Cập nhật phiếu thu"
                    },
                    DELETE: {
                        code: PERMISSION.RECEIPT_DELETE,
                        name: "Xóa phiếu thu"
                    },
                    APPROVE: {
                        code: PERMISSION.RECEIPT_APPROVE,
                        name: "Duyệt phiếu thu"
                    },
                    CANCEL: {
                        code: PERMISSION.RECEIPT_CANCEL,
                        name: "Hủy phiếu thu"
                    }
                }
            },
            TAX: {
                label: "Thuế",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_TAX,
                        name: "Xem danh sách thuế"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_TAX,
                        name: "Tạo thuế"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_TAX,
                        name: "Cập nhật thuế"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_TAX,
                        name: "Xóa thuế"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 3. MUA HÀNG (PURCHASING)
    // ============================================================================================
    PURCHASING: {
        label: "Mua hàng",
        items: {
            PURCHASE_ORDER: {
                label: "Đơn mua hàng",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.PURCHASE_ORDER_VIEW_ALL,
                        name: "Xem tất cả đơn mua"
                    },
                    CREATE: {
                        code: PERMISSION.PURCHASE_ORDER_CREATE,
                        name: "Tạo đơn mua"
                    },
                    UPDATE: {
                        code: PERMISSION.PURCHASE_ORDER_UPDATE,
                        name: "Cập nhật đơn mua"
                    },
                    DELETE: {
                        code: PERMISSION.PURCHASE_ORDER_DELETE,
                        name: "Xóa đơn mua"
                    },
                    APPROVE: {
                        code: PERMISSION.PURCHASE_ORDER_APPROVE,
                        name: "Duyệt đơn mua"
                    },
                    CANCEL: {
                        code: PERMISSION.PURCHASE_ORDER_CANCEL,
                        name: "Hủy đơn mua"
                    },
                    REVERT: {
                        code: PERMISSION.PURCHASE_ORDER_REVERT,
                        name: "Hoàn tác đơn mua"
                    }
                }
            },
            PURCHASE_CONTRACT: {
                label: "Hợp đồng mua hàng",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.PURCHASE_CONTRACT_VIEW_ALL,
                        name: "Xem tất cả hợp đồng mua"
                    },
                    CREATE: {
                        code: PERMISSION.PURCHASE_CONTRACT_CREATE,
                        name: "Tạo hợp đồng mua"
                    },
                    UPDATE: {
                        code: PERMISSION.PURCHASE_CONTRACT_UPDATE,
                        name: "Cập nhật hợp đồng mua"
                    },
                    DELETE: {
                        code: PERMISSION.PURCHASE_CONTRACT_DELETE,
                        name: "Xóa hợp đồng mua"
                    },
                    LIQUIDATE: {
                        code: PERMISSION.PURCHASE_CONTRACT_LIQUIDATE,
                        name: "Thanh lý hợp đồng mua"
                    }
                }
            },
            PAYMENT: {
                label: "Phiếu chi",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.PAYMENT_VIEW_ALL,
                        name: "Xem tất cả phiếu chi"
                    },
                    VIEW_OWN: {
                        code: PERMISSION.PAYMENT_VIEW_OWN,
                        name: "Xem phiếu chi của tôi"
                    },
                    CREATE: {
                        code: PERMISSION.PAYMENT_CREATE,
                        name: "Tạo phiếu chi"
                    },
                    UPDATE: {
                        code: PERMISSION.PAYMENT_UPDATE,
                        name: "Cập nhật phiếu chi"
                    },
                    DELETE: {
                        code: PERMISSION.PAYMENT_DELETE,
                        name: "Xóa phiếu chi"
                    },
                    APPROVE: {
                        code: PERMISSION.PAYMENT_APPROVE,
                        name: "Duyệt phiếu chi"
                    },
                    CANCEL: {
                        code: PERMISSION.PAYMENT_CANCEL,
                        name: "Hủy phiếu chi"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 4. BÁO CÁO (REPORTS)
    // ============================================================================================
    REPORTS: {
        label: "Báo cáo",
        items: {
            REVENUE: {
                label: "Báo cáo doanh thu",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_REPORT,
                        name: "Xem báo cáo doanh thu"
                    }
                }
            },
            PURCHASE: {
                label: "Báo cáo mua hàng",
                permissions: {
                    VIEW: {
                        code: PERMISSION.REPORT_PURCHASE_VIEW,
                        name: "Xem báo cáo mua hàng"
                    }
                }
            },
            UNDELIVERED: {
                label: "Báo cáo chưa giao",
                permissions: {
                    VIEW: {
                        code: PERMISSION.REPORT_UNDELIVERED_VIEW,
                        name: "Xem báo cáo chưa giao hàng"
                    }
                }
            },
            UNRECEIVED: {
                label: "Báo cáo chưa nhận",
                permissions: {
                    VIEW: {
                        code: PERMISSION.REPORT_UNRECEIVED_VIEW,
                        name: "Xem báo cáo chưa nhận hàng"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 5. SAU BÁN HÀNG (AFTER SALES)
    // ============================================================================================
    AFTER_SALES: {
        label: "Sau bán hàng",
        items: {
            WARRANTY: {
                label: "Bảo hành",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_WARRANTY,
                        name: "Xem danh sách bảo hành"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_WARRANTY,
                        name: "Cập nhật bảo hành"
                    },
                    SEND_REMINDER: {
                        code: PERMISSION.REMIND_WARRANTY,
                        name: "Gửi nhắc nhở bảo hành"
                    }
                }
            },
            EXPIRY: {
                label: "Hạn sử dụng",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.GET_EXPIRY,
                        name: "Xem tất cả hạn sử dụng"
                    },
                    VIEW_OWN: {
                        code: PERMISSION.GET_EXPIRY_USER,
                        name: "Xem hạn sử dụng của tôi"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_EXPIRY,
                        name: "Tạo hạn sử dụng"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_EXPIRY,
                        name: "Cập nhật hạn sử dụng"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_EXPIRY,
                        name: "Xóa hạn sử dụng"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 6. KHÁCH HÀNG & CSKH (CRM)
    // ============================================================================================
    CRM: {
        label: "Quản lý khách hàng",
        items: {
            CUSTOMER: {
                label: "Khách hàng",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.GET_CUSTOMER,
                        name: "Xem tất cả khách hàng"
                    },
                    VIEW_OWN: {
                        code: PERMISSION.GET_CUSTOMER_USER,
                        name: "Xem khách hàng của tôi"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_CUSTOMER,
                        name: "Tạo khách hàng"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_CUSTOMER,
                        name: "Cập nhật khách hàng"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_CUSTOMER,
                        name: "Xóa khách hàng"
                    }
                }
            },
            TICKET: {
                label: "Phiếu hỗ trợ",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_CUSTOMER_CARE,
                        name: "Xem danh sách phiếu hỗ trợ"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_CUSTOMER_CARE,
                        name: "Tạo phiếu hỗ trợ"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_CUSTOMER_CARE,
                        name: "Cập nhật phiếu hỗ trợ"
                    },
                    UPDATE_STATUS: {
                        code: PERMISSION.UPDATE_CUSTOMER_CARE_STATUS,
                        name: "Cập nhật trạng thái phiếu hỗ trợ"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_CUSTOMER_CARE,
                        name: "Xóa phiếu hỗ trợ"
                    }
                }
            },
            TASK: {
                label: "Nhiệm vụ CSKH",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_TASK,
                        name: "Xem danh sách nhiệm vụ"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_TASK,
                        name: "Tạo nhiệm vụ"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_TASK,
                        name: "Cập nhật nhiệm vụ"
                    },
                    UPDATE_STATUS: {
                        code: PERMISSION.UPDATE_TASK_STATUS,
                        name: "Cập nhật trạng thái nhiệm vụ"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_TASK,
                        name: "Xóa nhiệm vụ"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 7. SẢN PHẨM (PRODUCTS)
    // ============================================================================================
    PRODUCTS: {
        label: "Sản phẩm",
        items: {
            PRODUCT: {
                label: "Sản phẩm",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_PRODUCT,
                        name: "Xem danh sách sản phẩm"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_PRODUCT,
                        name: "Tạo sản phẩm"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_PRODUCT,
                        name: "Cập nhật sản phẩm"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_PRODUCT,
                        name: "Xóa sản phẩm"
                    }
                }
            },
            CATEGORY: {
                label: "Danh mục sản phẩm",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_CATEGORY,
                        name: "Xem danh sách danh mục sản phẩm"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_CATEGORY,
                        name: "Tạo danh mục sản phẩm"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_CATEGORY,
                        name: "Cập nhật danh mục sản phẩm"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_CATEGORY,
                        name: "Xóa danh mục sản phẩm"
                    }
                }
            },
            ATTRIBUTE: {
                label: "Thuộc tính",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_ATTRIBUTE,
                        name: "Xem danh sách thuộc tính"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_ATTRIBUTE,
                        name: "Tạo thuộc tính"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_ATTRIBUTE,
                        name: "Cập nhật thuộc tính"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_ATTRIBUTE,
                        name: "Xóa thuộc tính"
                    }
                }
            },
            UNIT: {
                label: "Đơn vị tính",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_UNIT,
                        name: "Xem danh sách đơn vị tính"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_UNIT,
                        name: "Tạo đơn vị tính"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_UNIT,
                        name: "Cập nhật đơn vị tính"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_UNIT,
                        name: "Xóa đơn vị tính"
                    }
                }
            },
            SUPPLIER: {
                label: "Nhà cung cấp",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_SUPPLIER,
                        name: "Xem danh sách nhà cung cấp"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_SUPPLIER,
                        name: "Tạo nhà cung cấp"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_SUPPLIER,
                        name: "Cập nhật nhà cung cấp"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_SUPPLIER,
                        name: "Xóa nhà cung cấp"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 8. KHO (WAREHOUSE & INVENTORY)
    // ============================================================================================
    WAREHOUSE: {
        label: "Kho hàng",
        items: {
            IMPORT: {
                label: "Nhập kho",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.WAREHOUSE_IMPORT_VIEW_ALL,
                        name: "Xem tất cả phiếu nhập kho"
                    },
                    CREATE: {
                        code: PERMISSION.WAREHOUSE_IMPORT_CREATE,
                        name: "Tạo phiếu nhập kho"
                    },
                    UPDATE: {
                        code: PERMISSION.WAREHOUSE_IMPORT_UPDATE,
                        name: "Cập nhật phiếu nhập kho"
                    },
                    DELETE: {
                        code: PERMISSION.WAREHOUSE_IMPORT_DELETE,
                        name: "Xóa phiếu nhập kho"
                    },
                    CONFIRM: {
                        code: PERMISSION.WAREHOUSE_IMPORT_CONFIRM,
                        name: "Xác nhận phiếu nhập kho"
                    },
                    POST: {
                        code: PERMISSION.WAREHOUSE_IMPORT_POST,
                        name: "Hạch toán phiếu nhập kho"
                    },
                    CANCEL: {
                        code: PERMISSION.WAREHOUSE_IMPORT_CANCEL,
                        name: "Hủy phiếu nhập kho"
                    }
                }
            },
            EXPORT: {
                label: "Xuất kho",
                permissions: {
                    VIEW_ALL: {
                        code: PERMISSION.WAREHOUSE_EXPORT_VIEW_ALL,
                        name: "Xem tất cả phiếu xuất kho"
                    },
                    CREATE: {
                        code: PERMISSION.WAREHOUSE_EXPORT_CREATE,
                        name: "Tạo phiếu xuất kho"
                    },
                    UPDATE: {
                        code: PERMISSION.WAREHOUSE_EXPORT_UPDATE,
                        name: "Cập nhật phiếu xuất kho"
                    },
                    DELETE: {
                        code: PERMISSION.WAREHOUSE_EXPORT_DELETE,
                        name: "Xóa phiếu xuất kho"
                    },
                    CONFIRM: {
                        code: PERMISSION.WAREHOUSE_EXPORT_CONFIRM,
                        name: "Xác nhận phiếu xuất kho"
                    },
                    POST: {
                        code: PERMISSION.WAREHOUSE_EXPORT_POST,
                        name: "Hạch toán phiếu xuất kho"
                    },
                    CANCEL: {
                        code: PERMISSION.WAREHOUSE_EXPORT_CANCEL,
                        name: "Hủy phiếu xuất kho"
                    }
                }
            },
            INVENTORY: {
                label: "Báo cáo tồn kho",
                permissions: {
                    VIEW_BALANCE: {
                        code: PERMISSION.INVENTORY_BALANCE_VIEW,
                        name: "Xem báo cáo tồn kho"
                    },
                    VIEW_SUMMARY: {
                        code: PERMISSION.INVENTORY_SUMMARY_VIEW,
                        name: "Xem báo cáo tổng hợp tồn kho"
                    },
                    VIEW_LEDGER: {
                        code: PERMISSION.INVENTORY_LEDGER_VIEW,
                        name: "Xem sổ chi tiết tồn kho"
                    },
                    VIEW_NXT: {
                        code: PERMISSION.INVENTORY_NXT_VIEW,
                        name: "Xem báo cáo xuất nhập tồn"
                    },
                    VIEW_VALUE: {
                        code: PERMISSION.INVENTORY_VALUE_VIEW,
                        name: "Xem báo cáo giá trị tồn kho"
                    },
                    VIEW_PRODUCT_STOCK: {
                        code: PERMISSION.INVENTORY_PRODUCT_VIEW,
                        name: "Xem tồn kho theo sản phẩm"
                    }
                }
            }
        }
    },

    // ============================================================================================
    // 9. CÀI ĐẶT (SETTINGS)
    // ============================================================================================
    SETTINGS: {
        label: "Cài đặt & Hệ thống", // Đổi tên để bao hàm cả Cài đặt và Hệ thống
        items: {
            USER: {
                label: "Danh sách người dùng",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_USER,
                        name: "Xem danh sách người dùng"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_USER,
                        name: "Tạo người dùng"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_USER,
                        name: "Cập nhật người dùng"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_USER,
                        name: "Xóa người dùng"
                    }
                }
            },
            ROLE: {
                label: "Vai trò & Quyền",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_ROLE,
                        name: "Xem danh sách vai trò"
                    },
                    CREATE: {
                        code: PERMISSION.CREATE_ROLE,
                        name: "Tạo vai trò"
                    },
                    UPDATE: {
                        code: PERMISSION.UPDATE_ROLE,
                        name: "Cập nhật vai trò"
                    },
                    DELETE: {
                        code: PERMISSION.DELETE_ROLE,
                        name: "Xóa vai trò"
                    },
                    VIEW_PERMISSION: {
                        code: PERMISSION.GET_PERMISSION,
                        name: "Xem danh sách quyền hạn"
                    }
                }
            },
            SYSTEM_LOG: {
                label: "Nhật ký hệ thống",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_AUDIT_LOG,
                        name: "Xem nhật ký hệ thống"
                    }
                }
            },
            // Các mục hiển thị trên Dashboard Hệ thống (Screenshot)
            BASIC_SETTINGS: {
                label: "Cài đặt thông tin cơ bản",
                permissions: {
                    VIEW: {
                        code: PERMISSION.GET_SETTING,
                        name: "Xem cài đặt cơ bản"
                    },
                    UPDATE: {
                        code: PERMISSION.GENERAL_SETTING,
                        name: "Cập nhật cài đặt cơ bản"
                    }
                }
            },
            // Lặp lại Audit Log cho Card Login History nếu cần (hoặc dùng chung)
            LOGIN_HISTORY: {
                label: "Lịch sử đăng nhập cá nhân",
                permissions: {
                    VIEW: {
                        code: PERMISSION.SESSION_SETTING,
                        name: "Xem lịch sử đăng nhập"
                    }
                }
            },
            SYSTEM_INFO: {
                label: "Thông tin hệ thống",
                permissions: {
                    VIEW: {
                        code: PERMISSION.SYSTEM_SETTING,
                        name: "Xem thông tin hệ thống"
                    },
                    STORAGE: {
                        code: PERMISSION.GET_STORAGE_SIZE_SETTING,
                        name: "Xem dung lượng lưu trữ"
                    }
                }
            }
        }
    }
}
