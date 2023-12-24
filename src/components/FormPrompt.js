import {useCallback, useEffect, useRef} from "react";
import {useBeforeUnload, useBlocker} from "react-router-dom";

export const FormPrompt = ({ hasUnsavedChanges }) => {
    const onLocationChange = useCallback(
        () => {
            if (hasUnsavedChanges) {
                return !window.confirm(
                    "You have unsaved changes, are you sure you want to leave?"
                );
            }
            return false;
        },
        [hasUnsavedChanges]
    );

    usePrompt(onLocationChange, hasUnsavedChanges);
    useBeforeUnload(
        useCallback(
            (event) => {
                if (hasUnsavedChanges) {
                    event.preventDefault();
                    event.returnValue = "";
                }
            },
            [hasUnsavedChanges]
        ),
        { capture: true }
    );

    return null;
};

function usePrompt(onLocationChange, hasUnsavedChanges) {
    const blocker = useBlocker(hasUnsavedChanges ? onLocationChange : false);
    const prevState = useRef(blocker.state);

    useEffect(() => {
        if (blocker.state === "blocked") {
            blocker.reset();
        }
        prevState.current = blocker.state;
    }, [blocker]);
}