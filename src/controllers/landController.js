const LandService = require("../services/LandService");

const LandController = {

    async createBuildingRecord(req, res) {
        try {
            const data = req.body;
            const files = req.files;
            const isExist = await LandService.isLandIdExists(data.landId);
            if (isExist) {
              return res.status(409).json({
                success: false,
                message: "Land ID already exists"
              });
            }
            // Multiple land images
            const landImages = files?.files?.map(f => f.path.replace(/\\/g, "/")) || [];
            data.buildingImages = landImages.join("@@@");

            // Single deed copy
            const deedCopyFile = files?.deedCopy?.[0];
            if (deedCopyFile) {
              data.deedCopyPath = deedCopyFile.path.replace(/\\/g, "/");
            }

            console.log("Land images:", data.buildingImages);
            console.log("Deed copy:", data.deedCopyPath);

            const result = await LandService.createBuilding(data, files);
            return res.status(201).json({
              success: true,
              message: "Land created successfully",
              data: result
            });

        } catch (error) {
            console.error("Error crteating in building:", error);
            return res.status(500).json({ error: "Internal server error" });        
        }
    },

    async fetchAllLandId(req, res){

        try {

            const result  = await LandService.landIds();
            return res.status(201).json({ message: "land ids fetch sucessfully", data: result[0]})
            
        } catch (error) {
            
        }

    }, 


    async fetchDataBylandId(req, res){
        console.log("comming id", req.params);
      const landId = req.params.landId; // just get the string

        try {

            const result  = await LandService.fetchRecordByLandId(landId);

            console.log("result ", result)
            return res.status(201).json({ message: "land ids fetch sucessfully", data: result[0]})
            
        } catch (error) {
            
        }

    },



async updateBuildingData(req, res) {
  const { landId } = req.params;   // ✅ correct
  const data = req.body;
  const files = req.files;

  console.log("Updating landId:", landId);

  try {
    await LandService.updateData(landId, data, files);

    return res.status(200).json({
      success: true,
      message: "Land details updated successfully",
    });
  } catch (error) {
    console.error("Update failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update land details",
    });
  }
}


}
module.exports = LandController;