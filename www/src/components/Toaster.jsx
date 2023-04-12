import React, { useState, forwardRef, useImperativeHandle } from "react";
import {Collapse} from 'bootstrap'

function Toaster(props, ref) {
    // const [error, setError] = useState(false);
    // const [warning, setWarning] = useState(false);
    const [alertType, setAlertType] = useState("success");
    const [message, setMessage] = useState("");
    const toasterRef = React.createRef();

    useImperativeHandle(ref, () => ({
        ShowError(msg) {
            setAlertType("danger");
            setMessage(msg);
            var node = toasterRef.current;
            new Collapse(node);
            setTimeout(() => new Collapse(node), 2000);
        },
        ShowSuccess(msg) {
            setAlertType("success");
            setMessage(msg);
            var node = toasterRef.current;
            new Collapse(node);
            setTimeout(() => new Collapse(node), 2000);
        },
        ShowInfo(msg) {
            setAlertType("primary");
            setMessage(msg);
            var node = toasterRef.current;
            new Collapse(node);
            setTimeout(() => new Collapse(node), 2000);
        },
    }));
    return (
        <div ref={toasterRef} className={"position-absolute top-0 end-0 alert alert-"+alertType+" collapse mt-3"} role="alert">
            {message}
        </div>
    )
}
export default forwardRef(Toaster)