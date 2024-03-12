import React from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";

function Home() {
return (
    <div>
        <Navbar />
        <h1 className="text-3xl ">History</h1>
        <MobileNavbar />
    </div>
);}

export default Home;