import Form from "../components/Form"
import { useParams } from "react-router-dom"

function LoginByForm() {
    const { formReference } = useParams();

    return <Form route="/api/token/" method="loginByForm" reference={formReference}/>
}

export default LoginByForm