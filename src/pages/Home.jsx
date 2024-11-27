import { useState } from 'react';
import '../output.css'; 
import Navbar from '../components/Navbar';
import Bargraph from '../components/Bargraph';
import GaugeChart from '../components/Gauge';  // Correct import
import PieChart from '../components/Piechart';  // Correct import

const Home = () => {
  const [showChart, setShowChart] = useState(false);
  const [showGauge, setShowGauge] = useState(false);
  const [showPie, setShowPie] = useState(false);
  
  const handleChart = () => {
    setShowChart((prev) => !prev); 
  };
  const handleGauge = () => {
    setShowGauge((prev) => !prev);
  }
  const handlePie = () => {
    setShowGauge((prev) => !prev);
  }

  return (
    <>
      <Navbar />
      <h1 className="text-3xl font-bold underline mt-6">
        Home
      </h1>
      <button 
        onClick={handleChart} 
        className="border-solid border-2 p-3 border-gray-900 rounded-md mt-10"
      >
        {showChart ? 'Hide Chart' : 'Show Chart'}
      </button>
      {showChart && <Bargraph />} 

      <button
        onClick={handleGauge}
        className='border-solid border-2 p-3 border-gray-900 rounded-md mt-10'
      >
        {showGauge ? 'Hide Gauge' : 'Show Gauge'}
      </button>
      {showGauge && <GaugeChart />}  

      <button
        onClick={handlePie}
        className='border-solid border-2 p-3 border-gray-900 rounded-md mt-10'
      >
        {showPie ? 'Hide PieChart' : 'Show Chart'}
      </button>
      {showPie && <PieChart/>}  
    </>
  );
};

export default Home;
