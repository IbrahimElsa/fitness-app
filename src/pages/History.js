import React from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { useTheme } from "../components/ThemeContext";

function HistoryPage() {
const { theme } = useTheme();

const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';

    return (
        <div className={`history-page ${containerClass}`}>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Navbar />
                    <FontAwesomeIcon icon={faScrewdriverWrench} size="4x"/>
                    <h1 className="text-3xl pt-5 font-bold">History Page WIP</h1>
                <MobileNavbar />
            </div>
        </div>
    );}

export default HistoryPage;