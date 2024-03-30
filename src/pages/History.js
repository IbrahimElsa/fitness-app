import React from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";

function HistoryPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Navbar />
                <FontAwesomeIcon icon={faScrewdriverWrench} size="4x"/>
                <h1 className="text-3xl pt-5">History Page WIP</h1>
            <MobileNavbar />
        </div>
    );}

export default HistoryPage;