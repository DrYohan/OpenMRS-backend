const pool = require("../config/database");

const ItemGrnApproveController = {
  async getAllGrnNo(req, res) {
    try {
      const [rows] = await pool.execute(
        "SELECT DISTINCT GrnNo FROM item_grn ORDER BY GrnNo ASC"
      );

      const grnNos = rows.map((row) => row.GrnNo).filter(Boolean);
      console.log("GRN Numbers found:", grnNos.length, grnNos);

      res.status(200).json({
        success: true,
        data: grnNos,
      });
    } catch (error) {
      console.error("Error fetching GRN numbers:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
        sqlMessage: error.sqlMessage,
      });
    }
  },

  async getRecordsByGrnNo(req, res) {
    try {
      const { grnNo } = req.params;
      console.log("Fetching records for GRN:", grnNo);

      const [itemRows] = await pool.execute(
        `SELECT * FROM item_grn WHERE GrnNo = ?`,
        [grnNo]
      );

      if (itemRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No records found for this GRN number",
        });
      }

      console.log(`Found ${itemRows.length} records for GRN: ${grnNo}`);

      // Process ALL items and flatten details
      const allDetails = [];

      for (const item of itemRows) {
        console.log("Processing item:", {
          ItemSerial: item.ItemSerial,
          ItemName: item.ItemName,
        });

        // For each item, create details
        const details = [
          {
            id: item.ItemSerial,
            center: item.StationId,
            location: item.X,
            department: item.DepartmentSerial,
            employee: item.EmployeeSerial,
            serial_no: item.SerialNo,
            book_no_local_id: item.BookNo,
            barcode_no: item.BarcodeNo,
            status: 0,
            item_grn_id: item.ItemSerial,
            ItemSerial: item.ItemSerial,
            GrnNo: item.GrnNo,
            ItemName: item.ItemName,
            MiddleCategory: item.MiddleCategory,
            SubCategoryId: item.SubCategoryId,
            Brand: item.Brand,
            Model: item.Model,
            Supplier: item.Supplier,
            PONo: item.PONo,
          },
        ];

        // Get names for display
        for (const detail of details) {
          let center_name = detail.center;
          let location_name = detail.location;
          let department_name = detail.department;
          let employee_name = detail.employee;

          // Get center name
          try {
            if (detail.center) {
              const [centerRows] = await pool.execute(
                "SELECT center_name FROM centers WHERE center_id = ?",
                [detail.center]
              );
              if (centerRows.length > 0) {
                center_name = centerRows[0].center_name;
              }
            }
          } catch (error) {
            console.log("Error fetching center name:", error.message);
          }

          // Get location name
          try {
            if (detail.location) {
              const [locRows] = await pool.execute(
                "SELECT location_name FROM locations WHERE location_id = ?",
                [detail.location]
              );
              if (locRows.length > 0) {
                location_name = locRows[0].location_name;
              }
            }
          } catch (error) {
            console.log("Error fetching location name:", error.message);
          }

          // Get department name
          try {
            if (detail.department) {
              const [deptRows] = await pool.execute(
                "SELECT department_name FROM departments WHERE department_id = ?",
                [detail.department]
              );
              if (deptRows.length > 0) {
                department_name = deptRows[0].department_name;
              }
            }
          } catch (error) {
            console.log("Error fetching department name:", error.message);
          }

          // Get employee name
          try {
            if (detail.employee) {
              const [empRows] = await pool.execute(
                "SELECT employee_name FROM employees WHERE employee_serial = ?",
                [detail.employee]
              );
              if (empRows.length > 0) {
                employee_name = empRows[0].employee_name;
              }
            }
          } catch (error) {
            console.log("Error fetching employee name:", error.message);
          }

          allDetails.push({
            ...detail,
            center_name,
            location_name,
            department_name,
            employee_name,
            // Include item info for reference
            item_middle_category: item.MiddleCategory,
            item_sub_category: item.SubCategoryId,
            item_name: item.ItemName,
            item_brand: item.Brand,
            item_model: item.Model,
            item_supplier: item.Supplier,
            item_po_no: item.PONo,
            item_date: item.PurchaseDate,
            item_invoice_no: item.InvoiceNo,
            item_unit_price: item.UnitPrice,
            item_inv_total: item.InvoiceTotal,
            item_manufacturer: item.Manufacture,
            item_type: item.Type,
            item_source: item.Source,
            item_receive_type: item.InType,
            item_remarks: item.Remarks,
            item_grn_date: item.GRNdate,
            item_warranty_expiry: item.WarrantyExpireDate,
            item_service_start: item.ServiceAgreementStartDate,
            item_service_end: item.ServiceAgreementEndDate,
            item_salvage_value: item.SalvageValue,
            item_replicate: item.ReplicateFlag,
            item_images: [
              item.Item1Pic,
              item.Item2Pic,
              item.Item3Pic,
              item.Item4Pic,
            ].filter(Boolean),
          });
        }
      }

      console.log(`Returning ${allDetails.length} details for GRN: ${grnNo}`);

      res.status(200).json({
        success: true,
        data: allDetails,
        summary: {
          totalItems: itemRows.length,
          totalDetails: allDetails.length,
          grnNo: grnNo,
        },
      });
    } catch (error) {
      console.error("Error fetching records by GRN number:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // Update status of a single item
  async updateItemStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (status !== 0 && status !== 1) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const [result] = await pool.execute(
        "UPDATE item_grn_details SET status = ? WHERE id = ?",
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating item status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // 🔥 ENHANCED FUNCTION: Get all fixed assets by GRN number with image info
  async getFixedAssetsByGrnNo(req, res) {
    try {
      const { grnNo } = req.params;
      console.log("Fetching fixed assets by GRN:", grnNo);

      // Get all data from fixed_asset_master table for the given GRN
      const [rows] = await pool.execute(
        `SELECT 
        ItemSerial,
        ItemCode,
        ItemName,
        MiddleCategory,
        SubCategoryId,
        SubCategory,
        Brand,
        Model,
        Supplier,
        PONo,
        PurchaseDate,
        InvoiceNo,
        UnitPrice,
        InvoiceTotal,
        InType as ReceiveType,
        Source,
        SalvageValue,
        Remarks,
        Manufacture,
        Type,
        WarrantyExpireDate,
        ServiceAgreementStartDate,
        ServiceAgreementEndDate,
        SerialNo,
        BookNo,
        Status,
        Item1Pic,
        Item2Pic,
        Item3Pic,
        Item4Pic,
        X as Location,
        Y,
        GrnNo,
        GRNdate,
        BarcodeNo,
        PurchaseType,
        CreatedAt,
        UpdatedAt,
        ReplicateFlag,
        CustomItemSerial,
        CurrentItemCode,
        StationId as Center,
        DepartmentSerial as Department,
        EmployeeSerial as Employee
      FROM fixed_asset_master 
      WHERE GrnNo = ?
      ORDER BY 
        CASE 
          WHEN ItemSerial LIKE '%-%' THEN 
            CAST(SUBSTRING_INDEX(ItemSerial, '-', -1) AS UNSIGNED)
          ELSE 0 
        END,
        ItemSerial`,
        [grnNo]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No fixed assets found for GRN: ${grnNo}`,
        });
      }

      console.log(`Found ${rows.length} fixed assets for GRN: ${grnNo}`);

      // Process rows to get display names and additional info
      const processedRows = await Promise.all(
        rows.map(async (item) => {
          let center_name = item.Center;
          let location_name = item.Location;
          let department_name = item.Department;
          let employee_name = item.Employee;

          // Get center name
          try {
            if (item.Center) {
              const [centerRows] = await pool.execute(
                "SELECT center_name FROM centers WHERE center_id = ?",
                [item.Center]
              );
              if (centerRows.length > 0) {
                center_name = centerRows[0].center_name;
              }
            }
          } catch (error) {
            console.log("Error fetching center name:", error.message);
          }

          // Get location name
          try {
            if (item.Location) {
              const [locRows] = await pool.execute(
                "SELECT location_name FROM locations WHERE location_id = ?",
                [item.Location]
              );
              if (locRows.length > 0) {
                location_name = locRows[0].location_name;
              }
            }
          } catch (error) {
            console.log("Error fetching location name:", error.message);
          }

          // Get department name
          try {
            if (item.Department) {
              const [deptRows] = await pool.execute(
                "SELECT department_name FROM departments WHERE department_id = ?",
                [item.Department]
              );
              if (deptRows.length > 0) {
                department_name = deptRows[0].department_name;
              }
            }
          } catch (error) {
            console.log("Error fetching department name:", error.message);
          }

          // Get employee name
          try {
            if (item.Employee) {
              const [empRows] = await pool.execute(
                "SELECT employee_name FROM employees WHERE employee_serial = ?",
                [item.Employee]
              );
              if (empRows.length > 0) {
                employee_name = empRows[0].employee_name;
              }
            }
          } catch (error) {
            console.log("Error fetching employee name:", error.message);
          }

          // Check which images exist
          const hasImages = {
            item1Pic: !!item.Item1Pic,
            item2Pic: !!item.Item2Pic,
            item3Pic: !!item.Item3Pic,
            item4Pic: !!item.Item4Pic,
          };

          const imageCount = Object.values(hasImages).filter(Boolean).length;

          return {
            ...item,
            center_name,
            location_name,
            department_name,
            employee_name,
            // Image information
            hasImages,
            imageCount,
            // Format dates for display
            PurchaseDate: item.PurchaseDate
              ? new Date(item.PurchaseDate).toISOString().split("T")[0]
              : null,
            GRNdate: item.GRNdate
              ? new Date(item.GRNdate).toISOString().split("T")[0]
              : null,
            WarrantyExpireDate: item.WarrantyExpireDate
              ? new Date(item.WarrantyExpireDate).toISOString().split("T")[0]
              : null,
            ServiceAgreementStartDate: item.ServiceAgreementStartDate
              ? new Date(item.ServiceAgreementStartDate)
                  .toISOString()
                  .split("T")[0]
              : null,
            ServiceAgreementEndDate: item.ServiceAgreementEndDate
              ? new Date(item.ServiceAgreementEndDate)
                  .toISOString()
                  .split("T")[0]
              : null,
            CreatedAt: item.CreatedAt
              ? new Date(item.CreatedAt).toISOString().split("T")[0]
              : null,
            UpdatedAt: item.UpdatedAt
              ? new Date(item.UpdatedAt).toISOString().split("T")[0]
              : null,
          };
        })
      );

      // Calculate summary statistics
      const approvedCount = processedRows.filter(
        (item) => item.Status === 1
      ).length;
      const rejectedCount = processedRows.filter(
        (item) => item.Status === 0
      ).length;
      const pendingCount = processedRows.filter(
        (item) => item.Status !== 1 && item.Status !== 0
      ).length;

      // Get unique item names
      const uniqueItemNames = [
        ...new Set(processedRows.map((item) => item.ItemName).filter(Boolean)),
      ];

      // Get centers and departments used
      const centersUsed = [
        ...new Set(
          processedRows.map((item) => item.center_name).filter(Boolean)
        ),
      ];
      const departmentsUsed = [
        ...new Set(
          processedRows.map((item) => item.department_name).filter(Boolean)
        ),
      ];

      res.status(200).json({
        success: true,
        data: processedRows,
        summary: {
          totalItems: processedRows.length,
          approved: approvedCount,
          rejected: rejectedCount,
          pending: pendingCount,
          grnNo: grnNo,
          firstItemSerial: processedRows[0]?.ItemSerial,
          lastItemSerial: processedRows[processedRows.length - 1]?.ItemSerial,
          itemNames: uniqueItemNames,
          centers: centersUsed,
          departments: departmentsUsed,
          hasImages: processedRows.some((item) => item.imageCount > 0),
          totalImages: processedRows.reduce(
            (sum, item) => sum + item.imageCount,
            0
          ),
        },
        message: `Successfully retrieved ${processedRows.length} fixed asset records for GRN: ${grnNo}`,
      });
    } catch (error) {
      console.error("Error fetching fixed assets by GRN:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
        sqlMessage: error.sqlMessage,
      });
    }
  },

  // 🔥 NEW FUNCTION: Get all data from fixed_asset_master table
  async getAllFixedAssets(req, res) {
    try {
      console.log("Fetching all data from fixed_asset_master table");

      // Get all data from fixed_asset_master table
      const [rows] = await pool.execute(
        `SELECT 
          ItemSerial,
          ItemCode,
          ItemName,
          MiddleCategory,
          SubCategoryId,
          SubCategory,
          Brand,
          Model,
          Supplier,
          PONo,
          PurchaseDate,
          InvoiceNo,
          UnitPrice,
          InvoiceTotal,
          InType as ReceiveType,
          Source,
          SalvageValue,
          Remarks,
          Manufacture,
          Type,
          WarrantyExpireDate,
          ServiceAgreementStartDate,
          ServiceAgreementEndDate,
          SerialNo,
          BookNo,
          Status,
          Item1Pic,
          Item2Pic,
          Item3Pic,
          Item4Pic,
          X as Location,
          Y,
          GrnNo,
          GRNdate,
          BarcodeNo,
          PurchaseType,
          CreatedAt,
          UpdatedAt,
          ReplicateFlag,
          CustomItemSerial,
          CurrentItemCode,
          StationId as Center,
          DepartmentSerial as Department,
          EmployeeSerial as Employee
        FROM fixed_asset_master 
        ORDER BY CreatedAt DESC`
      );

      console.log(`Found ${rows.length} records in fixed_asset_master`);

      // Process rows to get display names
      const processedRows = await Promise.all(
        rows.map(async (item) => {
          let center_name = item.Center;
          let department_name = item.Department;
          let employee_name = item.Employee;

          // Get center name
          try {
            if (item.Center) {
              const [centerRows] = await pool.execute(
                "SELECT center_name FROM centers WHERE center_id = ?",
                [item.Center]
              );
              if (centerRows.length > 0) {
                center_name = centerRows[0].center_name;
              }
            }
          } catch (error) {
            console.log("Error fetching center name:", error.message);
          }

          // Get department name
          try {
            if (item.Department) {
              const [deptRows] = await pool.execute(
                "SELECT department_name FROM departments WHERE department_id = ?",
                [item.Department]
              );
              if (deptRows.length > 0) {
                department_name = deptRows[0].department_name;
              }
            }
          } catch (error) {
            console.log("Error fetching department name:", error.message);
          }

          // Get employee name
          try {
            if (item.Employee) {
              const [empRows] = await pool.execute(
                "SELECT employee_name FROM employees WHERE employee_serial = ?",
                [item.Employee]
              );
              if (empRows.length > 0) {
                employee_name = empRows[0].employee_name;
              }
            }
          } catch (error) {
            console.log("Error fetching employee name:", error.message);
          }

          return {
            ...item,
            center_name,
            department_name,
            employee_name,
            // Format dates for display
            PurchaseDate: item.PurchaseDate
              ? new Date(item.PurchaseDate).toISOString().split("T")[0]
              : null,
            GRNdate: item.GRNdate
              ? new Date(item.GRNdate).toISOString().split("T")[0]
              : null,
            WarrantyExpireDate: item.WarrantyExpireDate
              ? new Date(item.WarrantyExpireDate).toISOString().split("T")[0]
              : null,
            ServiceAgreementStartDate: item.ServiceAgreementStartDate
              ? new Date(item.ServiceAgreementStartDate)
                  .toISOString()
                  .split("T")[0]
              : null,
            ServiceAgreementEndDate: item.ServiceAgreementEndDate
              ? new Date(item.ServiceAgreementEndDate)
                  .toISOString()
                  .split("T")[0]
              : null,
            CreatedAt: item.CreatedAt
              ? new Date(item.CreatedAt).toISOString().split("T")[0]
              : null,
            UpdatedAt: item.UpdatedAt
              ? new Date(item.UpdatedAt).toISOString().split("T")[0]
              : null,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: processedRows,
        total: rows.length,
        message: `Successfully retrieved ${rows.length} fixed asset records`,
      });
    } catch (error) {
      console.error("Error fetching fixed asset master data:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
        sqlMessage: error.sqlMessage,
      });
    }
  },

  // 🔥 NEW FUNCTION: Get single asset by ItemSerial
  async getFixedAssetById(req, res) {
    try {
      const { id } = req.params;
      console.log("Fetching fixed asset with ItemSerial:", id);

      const [rows] = await pool.execute(
        `SELECT 
          ItemSerial,
          ItemCode,
          ItemName,
          MiddleCategory,
          SubCategoryId,
          SubCategory,
          Brand,
          Model,
          Supplier,
          PONo,
          PurchaseDate,
          InvoiceNo,
          UnitPrice,
          InvoiceTotal,
          InType as ReceiveType,
          Source,
          SalvageValue,
          Remarks,
          Manufacture,
          Type,
          WarrantyExpireDate,
          ServiceAgreementStartDate,
          ServiceAgreementEndDate,
          SerialNo,
          BookNo,
          Status,
          Item1Pic,
          Item2Pic,
          Item3Pic,
          Item4Pic,
          X as Location,
          Y,
          GrnNo,
          GRNdate,
          BarcodeNo,
          PurchaseType,
          CreatedAt,
          UpdatedAt,
          ReplicateFlag,
          CustomItemSerial,
          CurrentItemCode,
          StationId as Center,
          DepartmentSerial as Department,
          EmployeeSerial as Employee
        FROM fixed_asset_master 
        WHERE ItemSerial = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Fixed asset not found",
        });
      }

      const item = rows[0];

      // Get display names
      let center_name = item.Center;
      let department_name = item.Department;
      let employee_name = item.Employee;

      // Get center name
      try {
        if (item.Center) {
          const [centerRows] = await pool.execute(
            "SELECT center_name FROM centers WHERE center_id = ?",
            [item.Center]
          );
          if (centerRows.length > 0) {
            center_name = centerRows[0].center_name;
          }
        }
      } catch (error) {
        console.log("Error fetching center name:", error.message);
      }

      // Get department name
      try {
        if (item.Department) {
          const [deptRows] = await pool.execute(
            "SELECT department_name FROM departments WHERE department_id = ?",
            [item.Department]
          );
          if (deptRows.length > 0) {
            department_name = deptRows[0].department_name;
          }
        }
      } catch (error) {
        console.log("Error fetching department name:", error.message);
      }

      // Get employee name
      try {
        if (item.Employee) {
          const [empRows] = await pool.execute(
            "SELECT employee_name FROM employees WHERE employee_serial = ?",
            [item.Employee]
          );
          if (empRows.length > 0) {
            employee_name = empRows[0].employee_name;
          }
        }
      } catch (error) {
        console.log("Error fetching employee name:", error.message);
      }

      const processedItem = {
        ...item,
        center_name,
        department_name,
        employee_name,
        // Format dates for display
        PurchaseDate: item.PurchaseDate
          ? new Date(item.PurchaseDate).toISOString().split("T")[0]
          : null,
        GRNdate: item.GRNdate
          ? new Date(item.GRNdate).toISOString().split("T")[0]
          : null,
        WarrantyExpireDate: item.WarrantyExpireDate
          ? new Date(item.WarrantyExpireDate).toISOString().split("T")[0]
          : null,
        ServiceAgreementStartDate: item.ServiceAgreementStartDate
          ? new Date(item.ServiceAgreementStartDate).toISOString().split("T")[0]
          : null,
        ServiceAgreementEndDate: item.ServiceAgreementEndDate
          ? new Date(item.ServiceAgreementEndDate).toISOString().split("T")[0]
          : null,
        CreatedAt: item.CreatedAt
          ? new Date(item.CreatedAt).toISOString().split("T")[0]
          : null,
        UpdatedAt: item.UpdatedAt
          ? new Date(item.UpdatedAt).toISOString().split("T")[0]
          : null,
      };

      res.status(200).json({
        success: true,
        data: processedItem,
        message: "Fixed asset retrieved successfully",
      });
    } catch (error) {
      console.error("Error fetching fixed asset by ID:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  // 🔥 NEW FUNCTION: Search/filter fixed assets
  async searchFixedAssets(req, res) {
    try {
      const {
        itemCode,
        itemName,
        grnNo,
        center,
        department,
        status,
        dateFrom,
        dateTo,
        page = 1,
        limit = 50,
      } = req.query;

      console.log("Searching fixed assets with filters:", req.query);

      let query = `SELECT 
        ItemSerial,
        ItemCode,
        ItemName,
        MiddleCategory,
        SubCategory,
        Brand,
        Model,
        Supplier,
        PONo,
        PurchaseDate,
        InvoiceNo,
        UnitPrice,
        InvoiceTotal,
        InType as ReceiveType,
        GrnNo,
        Status,
        SerialNo,
        BookNo,
        CreatedAt,
        UpdatedAt,
        StationId as Center,
        DepartmentSerial as Department
      FROM fixed_asset_master WHERE 1=1`;

      const params = [];

      // Add filters
      if (itemCode) {
        query += ` AND ItemCode LIKE ?`;
        params.push(`%${itemCode}%`);
      }

      if (itemName) {
        query += ` AND ItemName LIKE ?`;
        params.push(`%${itemName}%`);
      }

      if (grnNo) {
        query += ` AND GrnNo LIKE ?`;
        params.push(`%${grnNo}%`);
      }

      if (center) {
        query += ` AND StationId = ?`;
        params.push(center);
      }

      if (department) {
        query += ` AND DepartmentSerial = ?`;
        params.push(department);
      }

      if (status !== undefined) {
        query += ` AND Status = ?`;
        params.push(status);
      }

      if (dateFrom) {
        query += ` AND DATE(CreatedAt) >= ?`;
        params.push(dateFrom);
      }

      if (dateTo) {
        query += ` AND DATE(CreatedAt) <= ?`;
        params.push(dateTo);
      }

      // Add sorting and pagination
      query += ` ORDER BY CreatedAt DESC`;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      query += ` LIMIT ? OFFSET ?`;
      params.push(limitNum, offset);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM fixed_asset_master WHERE 1=1`;
      const countParams = params.slice(0, -2); // Remove LIMIT and OFFSET params

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      // Get paginated data
      const [rows] = await pool.execute(query, params);

      // Get display names for centers and departments
      const processedRows = await Promise.all(
        rows.map(async (item) => {
          let center_name = item.Center;
          let department_name = item.Department;

          // Get center name
          try {
            if (item.Center) {
              const [centerRows] = await pool.execute(
                "SELECT center_name FROM centers WHERE center_id = ?",
                [item.Center]
              );
              if (centerRows.length > 0) {
                center_name = centerRows[0].center_name;
              }
            }
          } catch (error) {
            console.log("Error fetching center name:", error.message);
          }

          // Get department name
          try {
            if (item.Department) {
              const [deptRows] = await pool.execute(
                "SELECT department_name FROM departments WHERE department_id = ?",
                [item.Department]
              );
              if (deptRows.length > 0) {
                department_name = deptRows[0].department_name;
              }
            }
          } catch (error) {
            console.log("Error fetching department name:", error.message);
          }

          return {
            ...item,
            center_name,
            department_name,
            PurchaseDate: item.PurchaseDate
              ? new Date(item.PurchaseDate).toISOString().split("T")[0]
              : null,
            CreatedAt: item.CreatedAt
              ? new Date(item.CreatedAt).toISOString().split("T")[0]
              : null,
          };
        })
      );

      res.status(200).json({
        success: true,
        data: processedRows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        message: `Found ${rows.length} fixed assets`,
      });
    } catch (error) {
      console.error("Error searching fixed assets:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message,
      });
    }
  },

  async handleApproveItems(req, res) {
    const connection = await pool.getConnection();

    try {
      const { itemGrn, itemGrnDetails } = req.body;
      console.log("Form Data:", itemGrn);
      console.log("Items Data:", itemGrnDetails);

      if (!itemGrn) {
        return res.status(400).json({
          success: false,
          message: "No GRN data provided",
        });
      }

      const data = itemGrn;
      await connection.beginTransaction();

      // 🔹 Get current year
      const year = new Date().getFullYear();

      // 🔹 Get last ItemCode for the year from fixed_asset_master
      const [lastRow] = await connection.execute(
        `SELECT ItemCode FROM fixed_asset_master WHERE ItemCode LIKE ? ORDER BY ItemCode DESC LIMIT 1`,
        [`${year}%`]
      );

      let serial = 0;
      if (lastRow.length > 0) {
        serial = parseInt(lastRow[0].ItemCode.slice(-6), 10);
      }

      // 🔹 Get ALL item_grn records for this GRN
      const [allItemGrnRows] = await connection.execute(
        `SELECT * FROM item_grn WHERE GrnNo = ?`,
        [data.grnNo]
      );

      if (allItemGrnRows.length === 0) {
        throw new Error(`No item_grn found with GrnNo: ${data.grnNo}`);
      }

      console.log(`Found ${allItemGrnRows.length} items to process`);

      // 🔹 Create a map of item_grn.ItemSerial to approval status
      const approvalStatusMap = {};
      itemGrnDetails.forEach((detail) => {
        approvalStatusMap[detail.id] = detail.status;
      });

      console.log("Approval Status Map:", approvalStatusMap);

      // 🔹 Filter approved items only
      const approvedItems = allItemGrnRows.filter((item) => {
        const status = approvalStatusMap[item.ItemSerial];
        return status === 1;
      });

      const rejectedItems = allItemGrnRows.filter((item) => {
        const status = approvalStatusMap[item.ItemSerial];
        return status === 0;
      });

      console.log(
        `Approved items: ${approvedItems.length}, Rejected items: ${rejectedItems.length}`
      );

      // 🔹 Process ONLY approved items
      for (let i = 0; i < approvedItems.length; i++) {
        const itemRow = approvedItems[i];

        // Generate UNIQUE ItemCode for EACH approved item
        serial += 1;
        const itemCode = `${year}${String(serial).padStart(6, "0")}`;
        console.log(`Generated ItemCode for approved item ${i + 1}:`, itemCode);

        // INSERT statement
        const sqlMaster = `
      INSERT INTO fixed_asset_master (
        ItemSerial, MiddleCategory, SubCategoryId, ItemName,
        PONo, Brand, Model, Supplier, PurchaseDate, InvoiceNo,
        UnitPrice, InvoiceTotal, InType, Source, SalvageValue,
        Remarks, SubCategory, Manufacture, Type, WarrantyExpireDate,
        ServiceAgreementStartDate, ServiceAgreementEndDate, SerialNo,
        BookNo, Status, Item1Pic, Item2Pic, X, Y, GrnNo, GRNdate,
        BarcodeNo, Item3Pic, Item4Pic, PurchaseType, CreatedAt,
        UpdatedAt, ReplicateFlag, ItemCode, CurrentItemCode,
        StationId, DepartmentSerial, EmployeeSerial
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

        const now = new Date();
        const valuesMaster = [
          itemRow.ItemSerial,
          itemRow.MiddleCategory,
          itemRow.SubCategoryId,
          itemRow.ItemName,
          itemRow.PONo,
          itemRow.Brand,
          itemRow.Model,
          itemRow.Supplier,
          itemRow.PurchaseDate,
          itemRow.InvoiceNo,
          itemRow.UnitPrice,
          itemRow.InvoiceTotal,
          itemRow.InType,
          itemRow.Source,
          itemRow.SalvageValue,
          itemRow.Remarks,
          itemRow.SubCategory,
          itemRow.Manufacture,
          itemRow.Type,
          itemRow.WarrantyExpireDate,
          itemRow.ServiceAgreementStartDate,
          itemRow.ServiceAgreementEndDate,
          itemRow.SerialNo,
          itemRow.BookNo,
          1, // Status = approved
          itemRow.Item1Pic,
          itemRow.Item2Pic,
          itemRow.X,
          itemRow.Y,
          itemRow.GrnNo,
          itemRow.GRNdate,
          itemRow.BarcodeNo,
          itemRow.Item3Pic,
          itemRow.Item4Pic,
          itemRow.PurchaseType,
          itemRow.CreatedAt || now,
          now,
          itemRow.ReplicateFlag,
          itemCode, // ItemCode (unique for each item)
          itemCode, // CurrentItemCode (same as ItemCode)
          itemRow.StationId, // StationId
          itemRow.DepartmentSerial, // DepartmentSerial
          itemRow.EmployeeSerial, // EmployeeSerial
        ];

        await connection.execute(sqlMaster, valuesMaster);
        console.log(
          `Inserted approved item ${itemRow.ItemSerial} into fixed_asset_master with ItemCode: ${itemCode}`
        );

        // Delete this approved item from item_grn table
        await connection.execute(`DELETE FROM item_grn WHERE ItemSerial = ?`, [
          itemRow.ItemSerial,
        ]);
      }

      // 🔹 Update rejected items in item_grn table (set Status = 0)
      for (const item of rejectedItems) {
        await connection.execute(
          `UPDATE item_grn SET Status = ? WHERE ItemSerial = ?`,
          [0, item.ItemSerial]
        );
        console.log(`Updated rejected item ${item.ItemSerial} status to 0`);
      }

      // 🔹 Skip item_grn_details update since table doesn't exist
      console.log("Skipping item_grn_details update - table doesn't exist");

      // 🔹 Skip item_grn_files update if table doesn't exist
      try {
        const [checkTable] = await connection.execute(
          `SHOW TABLES LIKE 'item_grn_files'`
        );
        if (checkTable.length > 0) {
          for (const itemRow of approvedItems) {
            await connection.execute(
              `UPDATE item_grn_files SET status = 1 WHERE item_grn_id = ?`,
              [itemRow.ItemSerial]
            );
          }
          console.log("Updated item_grn_files status for approved items");
        }
      } catch (fileError) {
        console.log("Skipping item_grn_files update:", fileError.message);
      }

      await connection.commit();

      // Check if there are any items left in item_grn for this GRN
      const [remainingItems] = await connection.execute(
        `SELECT COUNT(*) as count FROM item_grn WHERE GrnNo = ?`,
        [data.grnNo]
      );

      const response = {
        success: true,
        message: `${approvedItems.length} items approved and ${rejectedItems.length} items rejected successfully`,
        approved_count: approvedItems.length,
        rejected_count: rejectedItems.length,
      };

      if (approvedItems.length > 0) {
        response.first_item_code = `${year}${String(
          serial - approvedItems.length + 1
        ).padStart(6, "0")}`;
        response.last_item_code = `${year}${String(serial).padStart(6, "0")}`;
      }

      if (remainingItems[0].count === 0) {
        response.message += `. GRN ${data.grnNo} has been fully processed.`;
      } else {
        response.message += `. GRN ${data.grnNo} has ${remainingItems[0].count} rejected items remaining.`;
      }

      res.status(200).json(response);
    } catch (error) {
      await connection.rollback();
      console.error("Error handling GRN approval:", error);
      console.error("SQL Error Details:", error.sql);

      res.status(500).json({
        success: false,
        message: "Failed to approve GRN",
        error: error.message,
        sqlError: error.sqlMessage,
      });
    } finally {
      connection.release();
    }
  },
};

module.exports = ItemGrnApproveController;
