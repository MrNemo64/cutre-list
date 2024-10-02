import multer from "multer";

/**
 * A function that determines the destination folder for uploaded files
 * @callback folderChooser
 * @param {import("express").Request} req - Express request
 * @param {Express.Multer.File} file - Object containing information about the processed file
 * @returns {string} - Choosen folder path to store the processed file
 * @throws {Error} - If an error occurs
 */

/**
 * A function that generates the filename for uploaded files
 * @callback fileNamer
 * @param {import("express").Request} req - Express request
 * @param {Express.Multer.File} file - Object containing information about the processed file
 * @returns {string} - Choosen file name to store the processed file
 * @throws {Error} - If an error occurs
 */

/**
 * Creates a multer storage engine with the specified options for file upload.
 *
 * @param {Object} options - An object containing the following options:
 * @param {folderChooser} options.folderChooser - A function that determines the destination folder for uploaded files.
 * @param {fileNamer} options.fileNamer - A function that generates the filename for uploaded files.
 *
 * @returns {multer.Multer} A Multer instance configured with the specified storage engine.
 *
 * @example
 * const storageOptions = {
 *   folderChooser: (req, file) => {
 *     // Your logic to determine the destination folder
 *     return "uploads/";
 *   },
 *   fileNamer: (req, file) => {
 *     // Your logic to generate the filename
 *     return Date.now() + "_" + file.originalname;
 *   }
 * };
 * const upload = createStorage(storageOptions);
 *
 * // Use the 'upload' instance as middleware in your route.
 * app.post("/upload", upload.single("file"), (req, res) => {
 *   // Handle the file upload here
 * });
 */
export function createStorage(options) {
    const storage = multer.diskStorage({
        destination: (req, file, next) => {
            try {
                next(null, options.folderChooser(req, file));
            } catch(e) {
                next(e, null);
            }
        },
        filename: (req, file, next) => {
            try {
                next(null, options.fileNamer(req, file));
            } catch(e) {
                next(e, null);
            }
        },
    });
    return multer({storage: storage});
}