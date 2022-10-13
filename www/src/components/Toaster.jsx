import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import {Collapse} from 'bootstrap'

function Toaster(props, ref) {
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const toasterRef = React.createRef();

    useImperativeHandle(ref, () => ({
        ShowError(msg) {
            setError(true);
            setMessage(msg);
            var node = toasterRef.current;
            new Collapse(node);
            setTimeout(() => new Collapse(node), 2000);
        },
        ShowSuccess(msg) {
            setError(false);
            setMessage(msg);
            var node = toasterRef.current;
            new Collapse(node);
            setTimeout(() => new Collapse(node), 2000);
        },
    }));
    return (
        <div ref={toasterRef} className={"alert "+(error?"alert-error":"alert-success")+" collapse mt-3"} role="alert">
            {message}
        </div>
    )
}
export default forwardRef(Toaster)