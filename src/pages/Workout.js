import React from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";

function Home() {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex-1 bg-gray-800 text-white p-4 overflow-y-auto">
                <h1 className="text-3xl mb-4">Workout</h1>
                <div className="bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3 rounded mb-4">
                    START AN EMPTY WORKOUT
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">My Templates</span>
                    <button className="text-blue-600 bg-white font-bold py-2 px-4 rounded">
                        +
                    </button>
                </div>

                <div className="text-center text-gray-400 mb-4">
                    You don't have any custom templates yet.<br />
                    Tap the '+' button to create your first template!
                </div>
                <div className="mb-4">
                    <h2 className="text-lg font-bold mb-2">Sample Templates</h2>
                    <div className="bg-gray-700 rounded p-3 mb-4">
                        <h3 className="font-bold text-lg mb-2">Legs</h3>
                            <div className="text-gray-300 mb-2">
                                <p>3 x Squat (Barbell)</p>
                                <p>3 x Leg Extension (Machine)</p>
                                <p>3 x Hamstring Curl</p>
                                <p>3 x Standing Calf Raise (Smith Machine)</p>
                            </div>
                    </div>
                    <div className="bg-gray-700 rounded p-3 mb-4">
                        <h3 className="font-bold text-lg mb-2">Chest & Triceps</h3>
                            <div className="text-gray-300 mb-2">
                                <p>3 x Bench Press (Barbell)</p>
                                <p>3 x Incline Bench Press (Barbell)</p>
                                <p>3 x Shoulder Press (Machine)</p>
                                <p>3 x Skullcrusher (Barbell)</p>
                            </div>
                        {/* ... more exercises */}
                    </div>
                    <div className="bg-gray-700 rounded p-3 mb-14">
                        <h3 className="font-bold text-lg mb-2">Back & Biceps</h3>
                        <div className="text-gray-300 mb-2">
                            <p>3 x Seated Row (Machine)</p>
                            <p>3 x Lat Pulldown (Cable)</p>
                            <p>3 x Lateral Raise (Dumbell)</p>
                            <p>3 x Bicep curl (Dumbell)</p>
                            <p>3 x Hammer curl (Cable)</p>
                        </div>
                    </div>
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default Home;
