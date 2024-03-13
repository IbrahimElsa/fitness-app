import React from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";

function Home() {
return (
    <div>
        <Navbar />
        <div className="flex flex-col items-center h-screen bg-gray-200 p-4">
            <h1 className="text-3xl ">Workout</h1>
        </div>
        <MobileNavbar />
    </div>
);}

export default Home;