import React, { 
    useEffect,
    useState,
    useRef 
}                           from 'react'
import { useDispatch }      from 'react-redux';
import { 
    deleteUserEvent, 
    updateUserEvent, 
    UserEvent 
}                           from '../../redux/user-events';


interface Props {
    event: UserEvent
}

const EventItem: React.FC<Props> = ({ event }) => {
    const dispatch              = useDispatch<any>();
    const inputRef              = useRef<HTMLInputElement>(null);
    const [ edit, setEdit ]     = useState(false);
    const [ title, setTitle ]   = useState(event.title);

    useEffect(() => {
        if (edit)
            inputRef.current?.focus();
    }, [ edit ])

    const handleDelete = () => {
        dispatch(deleteUserEvent(event.id));
    }

    const titleClick = () => {
        setEdit(true)
    }

    const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }

    const handleBlurInput = () => {
        if (title !== event.title)
            dispatch(updateUserEvent({
                ...event,
                title
            }));

        setEdit(false);
    }

  return (
        <div className="calendar-event">
            <div className="calendar-event-info">
            <div className="calendar-event-time">11:00 - 12:00</div>
            <div className="calendar-event-title">
                {
                    edit
                        ?   <input 
                                type    = "text" 
                                ref     = { inputRef } 
                                value   = { title }
                                onChange= { handleChangeInput }
                                onBlur  = { handleBlurInput }
                            />
                        :   <span onClick={ titleClick }>{event.title}</span>
                } 
                
            </div>
            </div>
            <button className="calendar-event-delete-button" onClick={ handleDelete }>
            &times;
            </button>
        </div>
  )
}

export default EventItem