import { useState, useRef } from "react";
import PrimaryButtonEvent from "./PrimaryButtonEvent";

const FILE_NAME_LIMIT_CHARS = 45;

export default function FileUploadInput({ footerText = "", setFiles, inputName, accept }) {

    const [fileName, setFileName] = useState("Upload a file...");
    const fileSelector = useRef(null);

    const openFileSelector = () => {
        fileSelector.current.click();
    }

    const handleImageSubmit = (e) => {
        e.preventDefault();
        setFileName(fileSelector.current.files[0].name || "Unknown name");
        setFiles(fileSelector.current.files[0]);
    }

    const limitFileNameSize = () => {
        if (fileName.length > FILE_NAME_LIMIT_CHARS) {
            return fileName.substring(0, FILE_NAME_LIMIT_CHARS) + " ...";
        }
        return fileName
    }

    return (
        <div className="py-1 text-white">
            <div className="flex">
                <PrimaryButtonEvent onClick={() => openFileSelector()}>Upload Image</PrimaryButtonEvent>
                <p className="self-center ms-2 max-w-fit overflow-scroll">{limitFileNameSize(fileName)}</p>
                <input type="file" accept={ accept } name={inputName } id="img-upload" ref={ fileSelector } onChange={(e) => handleImageSubmit(e)} hidden />
            </div>
            {footerText ?
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">{ footerText }</p>
                :
                <></>
            }


        </div>
    )

}
