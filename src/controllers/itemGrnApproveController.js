const pool = require("../config/database");

const ItemGrnApproveController = {
  async getAllGrnNo(req, res) {
    try {
      const [rows] = await pool.execute(
        "SELECT DISTINCT GrnNo FROM item_grn WHERE Status IS NULL ORDER BY GrnNo ASC"
      );
      const grnNos = rows.map((row) => row.GrnNo);
      res.status(200).json({
        success: true,
        data: grnNos,
      });
    } catch (error) {
      console.error("Error fetching GRN numbers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getRecordsByGrnNo(req, res) {
    try {
      const { grnNo } = req.params;
      const query = `
          SELECT
            h.GrnNo,
            h.MiddleCategory,
            h.CurrentItemCode,
            h.Supplier,
            h.PONo,
            h.InvoiceNo,
            h.UnitPrice,
            h.InvoiceTotal,
            h.SalvageValue,
            h.Remarks,
            h.SubCategory,
            h.ItemName,
            h.Brand,
            h.Model,
            h.Manufacture,
            h.Type,
            h.WarrantyExpireDate,
            h.ServiceAgreementStartDate,
            h.ServiceAgreementEndDate,
            h.BarcodeNo,
            h.GRNdate,
            h.Source,
            h.PurchaseType,
            h.Y,
            h.Item1Pic,
            h.Item2Pic,
            h.Item3Pic,
            h.Item4Pic,
            h.CreatedAt,
            h.UpdatedAt,
            d.itemDetails
          FROM
            (
              SELECT *
              FROM item_grn
              WHERE GrnNo = ?
              ORDER BY CreatedAt ASC
              LIMIT 1
            ) h
          JOIN
            (
              SELECT
                GrnNo,
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'ItemSerial', i.ItemSerial,
                    'StationId', i.StationId,
                    'X', i.X,
                    'DepartmentSerial', i.DepartmentSerial,
                    'EmployeeSerial', i.EmployeeSerial,
                    'SerialNo', i.SerialNo,
                    'BookNo', i.BookNo,
                    'Status', i.Status,
                    'EmployeeName', e.employee_name,
                    'CenterName', c.center_name,
                    'DepartmentName', d.department_name,
                    'LocationName', l.location_name
                  )
                ) AS itemDetails
              FROM item_grn i
              LEFT JOIN employees e ON i.EmployeeSerial = e.id
              LEFT JOIN centers c ON i.StationId = c.center_id
              LEFT JOIN departments d ON i.DepartmentSerial = d.department_id
              LEFT JOIN Locations l ON i.X = l.location_id
              WHERE GrnNo = ?
              GROUP BY GrnNo
            ) d
          ON h.GrnNo = d.GrnNo;
        `;
      const [rows] = await pool.execute(query, [grnNo, grnNo]);
      res.status(200).json({
        success: true,
        data: rows.length ? rows[0] : null,
      });
    } catch (error) {
      console.error("Error fetching records by GRN number:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async handleApproveItems(req, res) {
    const connection = await pool.getConnection();
    try {
      const { itemGrn, itemGrnDetails } = req.body;
      if (!itemGrn || !Array.isArray(itemGrnDetails)) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      await connection.beginTransaction();
      await Promise.all(
        itemGrnDetails.map(item =>
          connection.execute(
            `UPDATE item_grn SET Status = ? WHERE ItemSerial = ?`,
            [Number(item.Status), item.ItemSerial]
          )
        )
      );
      const approvedItemSerials = itemGrnDetails
        .filter(item => Number(item.Status) === 1)
        .map(item => item.ItemSerial);

      if (approvedItemSerials.length === 0) {
        await connection.commit();
        return res.json({ message: "No approved items to process" });
      }
      const year = new Date().getFullYear();
      const [lastRow] = await connection.execute(
        `SELECT ItemCode
        FROM fixed_asset_master
        WHERE ItemCode LIKE ?
        ORDER BY ItemCode DESC
        LIMIT 1`,
        [`${year}%`]
      );

      let serial = lastRow.length
        ? parseInt(lastRow[0].ItemCode.slice(4), 10)
        : 0;
      for (const itemSerial of approvedItemSerials) {
        serial += 1;
        const itemCode = `${year}${String(serial).padStart(6, "0")}`;

        await connection.execute(
          `
          INSERT INTO fixed_asset_master
          (
            ItemSerial, StationId, MiddleCategory, DepartmentSerial, EmployeeSerial,
            CurrentItemCode, SupplierSerial, Supplier, PONo, PurchaseDate,
            InvoiceNo, UnitPrice, InvoiceTotal, InType, Source, SalvageValue,
            Remarks, SubCategoryId, SubCategory, ItemName, Brand, Model,
            Manufacture, Type, WarrantyExpireDate, ServiceAgreementStartDate,
            ServiceAgreementEndDate, SerialNo, BookNo, Status,
            Item1Pic, Item2Pic, X, Y, GrnNo, GRNdate,
            VoucherNo, VoucherDate, TransportCost, RefNo,
            InstallationCost, NBT, VAT, OtherCost,
            ApprovedBy, AuthorityGivenBy, AgreementNo, Author,
            IsbnNo, Capacity, Press, CBy, CDate,
            OperSystem, ManufAddress, ManufDate, RegistrationNo,
            LicenseFee, EngineNo, ChassisNo, Drive, FuelType,
            Lubricants, Material, CapacitySize,
            ReValueDate, ReValueAmount, ReValueRmarks,
            BarcodeNo, Item3Pic, Item4Pic, Vote, PurchaseType,
            ItemAppBy, ItemAppDate, UnitSerial, SubUnitSerial,
            BookNo2, Level3Serial, CreatedAt, UpdatedAt,
            ReplicateFlag, CustomItemSerial, ItemCode
          )
          SELECT
            ItemSerial, StationId, MiddleCategory, DepartmentSerial, EmployeeSerial,
            CurrentItemCode, SupplierSerial, Supplier, PONo, PurchaseDate,
            InvoiceNo, UnitPrice, InvoiceTotal, InType, Source, SalvageValue,
            Remarks, SubCategoryId, SubCategory, ItemName, Brand, Model,
            Manufacture, Type, WarrantyExpireDate, ServiceAgreementStartDate,
            ServiceAgreementEndDate, SerialNo, BookNo, Status,
            Item1Pic, Item2Pic, X, Y, GrnNo, GRNdate,
            VoucherNo, VoucherDate, TransportCost, RefNo,
            InstallationCost, NBT, VAT, OtherCost,
            ApprovedBy, AuthorityGivenBy, AgreementNo, Author,
            IsbnNo, Capacity, Press, CBy, CDate,
            OperSystem, ManufAddress, ManufDate, RegistrationNo,
            LicenseFee, EngineNo, ChassisNo, Drive, FuelType,
            Lubricants, Material, CapacitySize,
            ReValueDate, ReValueAmount, ReValueRmarks,
            BarcodeNo, Item3Pic, Item4Pic, Vote, PurchaseType,
            ItemAppBy, ItemAppDate, UnitSerial, SubUnitSerial,
            BookNo2, Level3Serial, CreatedAt, UpdatedAt,
            ReplicateFlag, CustomItemSerial, ?
          FROM item_grn
          WHERE ItemSerial = ? AND Status = 1
          `,
          [itemCode, itemSerial]
        );
      }
      await connection.commit();
      res.status(200).json({
        message: "Approved items successfully copied to fixed_asset_master",
        approvedCount: approvedItemSerials.length
      });

    } catch (error) {
      await connection.rollback();
      console.error("Error handling GRN approval:", error);
      res.status(500).json({
        message: "Failed to approve GRN items",
        error: error.message
      });
    } finally {
      connection.release();
    }
  }

};
module.exports = ItemGrnApproveController;
