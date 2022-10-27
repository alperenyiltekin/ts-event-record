import { Action }       from "redux";
import { RootState }    from "./store";

interface RecorderState {
    dateStart: string;
}
// types
const START = 'RECORDER_START';
const STOP  = 'RECORDER_STOP';

type StartAction= Action<typeof START>;
type StopAction = Action<typeof STOP>;

// action creators
export const start = (): StartAction => ({
    type: START
});

export const stop = (): StopAction => ({
    type: STOP
});

export const selectRecorderState = (rootState: RootState) => rootState.recorder;

export const selectDateStart = (rootState: RootState) => selectRecorderState(rootState).dateStart;

const initialState: RecorderState = {
    dateStart: ""
}

// reducers
const recorderReducer = (state: RecorderState = initialState, action: StartAction | StopAction) => {
    switch (action.type) {
        case START:
            return {
                ...state,
                dateStart: new Date().toISOString()
            }
        case STOP:
            return {
                ...state,
                dateStart: ''
            }
    
        default:
            return state;
    }
}

export default recorderReducer;