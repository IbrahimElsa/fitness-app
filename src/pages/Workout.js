import React from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";

function Home() {
    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center h-screen bg-gray-200 p-4">
                <h1 className="text-3xl">Workout</h1>
                <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 w-11/12 rounded">
                    START AN EMPTY WORKOUT
                </button>
                <div className="self-start mt-4 flex justify-between w-full px-4">
                    <span>My Templates</span>
                    <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-bold text-xl hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                        +
                    </button>
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default Home;
