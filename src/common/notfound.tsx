import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const handlenav = () => {
    const role = localStorage.getItem("role");
    if (!role) {
      navigate("/");
      return;
    }
    navigate(`/${role}/profile`);
  };
  return (
    <div className="flex flex-col justify-center items-center pt-24">
      <h1 className="text-red-500 text-2xl">404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Button className="bg-red-500 mt-4 hover:bg-red-600" onClick={handlenav}>
        Go back
      </Button>
    </div>
  );
};

export default NotFound;
