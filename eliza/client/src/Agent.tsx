import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Agent() {
    const navigate = useNavigate();
    const { agentId } = useParams();

    useEffect(() => {
        navigate(`/${agentId}/chat`, { replace: true });
    }, [agentId, navigate]);

    return null;
}
