const LandRepository = require("../repository/landRepository");

const landService = {
  async createBuilding(data, files) {
    try {
      // You can process files here if needed
      return await LandRepository.registerBuildingData(data,files);

    } catch (error) {
      console.error("Error in creating building (service):", error);
      throw error;
    }
  },
  async landIds() {
    try {
      // You can process files here if needed
      return await LandRepository.getAllLandIds();
    } catch (error) {
      console.error("Error in creating building (service):", error);
      throw error;
    }
  },  

  async fetchRecordByLandId(landId) {
    try {
      // You can process files here if needed
      return await LandRepository.fetchDataBylandId(landId);
    } catch (error) {
      console.error("Error in creating building (service):", error);
      throw error;
    }
  },  

  async updateData(landId, data, files) {
    try {
      /* ---------- LAND IMAGES ---------- */
      let landImages = "";

      if (data.existingFiles) {
        landImages = Array.isArray(data.existingFiles)
          ? data.existingFiles.join("@@@")
          : data.existingFiles;
      }

      if (files?.files?.length) {
        const newImages = files.files.map(f => f.path).join("@@@");
        landImages = landImages
          ? `${landImages}@@@${newImages}`
          : newImages;
      }

      /* ---------- DEED COPY ---------- */
      let deedCopyPath = data.existingDeedCopy || null;

      if (files?.deedCopy?.length) {
        deedCopyPath = files.deedCopy[0].path;
      }

      data.buildingImages = landImages || null;
      data.deedCopyPath = deedCopyPath;

      return await LandRepository.updateLandData(landId, data);
    } catch (error) {
      console.error("Service update error:", error);
      throw error;
    }
  },

  async isLandIdExists(landId){
    try {
      return await LandRepository.landIdExists(landId)
      
    } catch (error) {
      
    }
  }

};

module.exports = landService;
