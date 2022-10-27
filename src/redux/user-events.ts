import { 
    Action, 
    AnyAction 
}                           from "redux";
import { ThunkAction }      from "redux-thunk";
import { selectDateStart }  from "./recorder";
import { RootState }        from "./store";

// action types
const LOAD_REQUEST      = 'LOAD_REQUEST';
const LOAD_SUCCESS      = 'LOAD_SUCCESS';
const LOAD_FAIL         = 'LOAD_FAIL';

const CREATE_REQUEST    = 'CREATE_REQUEST';
const CREATE_SUCCESS    = 'CREATE_SUCCESS';
const CREATE_FAIL       = 'CREATE_FAIL';

const DELETE_REQUEST    = 'DELETE_REQUEST';
const DELETE_SUCCESS    = 'DELETE_SUCCESS';
const DELETE_FAIL       = 'DELETE_FAIL';

const UPDATE_REQUEST    = 'UPDATE_REQUEST';
const UPDATE_SUCCESS    = 'UPDATE_SUCCESS';
const UPDATE_FAIL       = 'UPDATE_FAIL';


interface LoadRequestAction extends Action<typeof LOAD_REQUEST> {}

interface LoadSuccessAction extends Action<typeof LOAD_SUCCESS> {
    payload: {
        events: UserEvent[]
    }
}

interface LoadFailAction extends Action<typeof LOAD_FAIL> {
    error: string
}

export interface UserEvent {
    id          : number;
    title       : string;
    dateStart   : string;
    dateEnd     : string;
}

interface UserEventsState {
    byIds   : Record<UserEvent['id'], UserEvent>;
    allIds  : UserEvent['id'][];
}

interface CreateRequestAction extends Action<typeof CREATE_REQUEST> {}

interface CreateSuccessAction extends Action<typeof CREATE_SUCCESS> {
    payload: {
        event: UserEvent
    }
}

interface CreateFailAction extends Action<typeof CREATE_FAIL> {}

interface DeleteRequestAction extends Action<typeof DELETE_REQUEST> {}

interface DeleteSuccessAction extends Action<typeof DELETE_SUCCESS> {
    payload: {
        id: UserEvent['id']
    }
}

interface DeleteFailAction extends Action<typeof DELETE_FAIL> {}

interface UpdateRequestAction extends Action<typeof UPDATE_REQUEST> {}

interface UpdateSuccessAction extends Action<typeof UPDATE_SUCCESS> {
    payload: {
        event: UserEvent
    }
}

interface UpdateFailAction extends Action<typeof UPDATE_FAIL> {}


export const loadUserEvents = (): ThunkAction<
    void, 
    RootState, 
    undefined, 
    LoadRequestAction | LoadSuccessAction | LoadFailAction
    > => async (dispatch, getState) => {
    dispatch({
        type: LOAD_REQUEST
    });

    try {
        const res = await fetch('http://localhost:3002/events');
        const events: UserEvent[] = await res.json();

        dispatch({
            type: LOAD_SUCCESS,
            payload: { events }
        });

    } catch (error) {
        dispatch({
            type: LOAD_FAIL,
            error: "Events loading failed."
        })
    }
}

export const createUserEvent = (): ThunkAction<
    Promise<void>, 
    RootState, 
    undefined, 
    CreateRequestAction | CreateSuccessAction | CreateFailAction | AnyAction
    > => async (dispatch, getState) => {
    dispatch({
        type: CREATE_REQUEST
    })

    try {
        const dateStart = selectDateStart(getState());
        const event: Omit<UserEvent, 'id'> = {
            title: 'No name',
            dateStart,
            dateEnd: new Date().toISOString()
        };

        const res = await fetch(`http://localhost:3002/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        const createdEvent: UserEvent = await res.json();

        dispatch({
            type: CREATE_SUCCESS,
            payload: {
                event: createdEvent
            }
        })

    } catch (error) {
        dispatch({
            type: CREATE_FAIL
        })
    }
}

const selectUserEventsState = (rootState: RootState) => rootState.userEvents;

export const selectUserEventsArray = (rootState: RootState) => {
    const state = selectUserEventsState(rootState);
    return state.allIds.map(id => state.byIds[id]);
}

export const deleteUserEvent = (id: UserEvent['id']): ThunkAction<
    Promise<void>, 
    RootState,
    undefined, 
    DeleteRequestAction | DeleteSuccessAction | DeleteFailAction
    > => async (dispatch) => {
    dispatch({
        type: DELETE_REQUEST
    });

    try {
        const res = await fetch(`http://localhost:3002/events/${id}`, {
            method: 'DELETE'
        })

        if (res.ok)
            dispatch({
                type: DELETE_SUCCESS,
                payload: {
                    id
                }
            })

    } catch (error) {
        dispatch({
            type: DELETE_FAIL
        })
    }
}

export const updateUserEvent = (event: UserEvent): ThunkAction<
    Promise<void>, 
    RootState,
    undefined, 
    UpdateRequestAction | UpdateSuccessAction | UpdateFailAction
> => async dispatch => {
    dispatch({
        type: UPDATE_REQUEST
    });

    try {
        const res = await fetch(`http://localhost:3002/events/${event.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        });

        const updatedEvent: UserEvent = await res.json();

        dispatch({
            type: UPDATE_SUCCESS,
            payload: {
                event: updatedEvent
            }
        })
    } catch (error) {
        dispatch({
            type: UPDATE_FAIL
        })
    }
}

const initialState: UserEventsState = {
    byIds: {},
    allIds: []
}

const userEventsReducer = (
    state: UserEventsState = initialState , 
    action: LoadSuccessAction | CreateSuccessAction | DeleteSuccessAction | UpdateSuccessAction) => {
    switch (action.type) {
        case LOAD_SUCCESS:
            const { events } = action.payload;
            return {
                ...state,
                allIds  : events.map(({ id }) => id),
                byIds   : events.reduce<UserEventsState['byIds']>((byIds, event) => {
                    byIds[event.id] = event;
                    return byIds;
                }, {})
            };
        case CREATE_SUCCESS:
            const { event } = action.payload;
            return {
                ...state,
                allIds  : [ 
                    ...state.allIds, 
                    event.id 
                ],
                byIds   : {
                    ...state.byIds, 
                    [event.id] : event 
                }
            }
        case DELETE_SUCCESS:
            const { id } = action.payload;
            const newState = {
                ...state,
                byIds   : {
                    ...state.byIds
                },
                allIds  : state.allIds.filter(storeId => storeId !== id)
            };
            delete newState.byIds[id];
            return newState;
        case UPDATE_SUCCESS:
            const { event: updatedEvent } = action.payload;
            return {
                ...state,
                byIds: {
                    ...state.byIds,
                    [ updatedEvent.id ]: updatedEvent
                }
            }
        default:
            return state;
    }
}

export default userEventsReducer;