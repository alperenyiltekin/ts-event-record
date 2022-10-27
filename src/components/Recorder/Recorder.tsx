import React, { 
    useEffect, 
    useRef, 
    useState 
}                           from 'react'
import { 
    useSelector, 
    useDispatch 
}                           from 'react-redux';
import { 
    selectDateStart, 
    start,
    stop
}                           from '../../redux/recorder';
import CN                   from 'classnames';
import { addZeroTimeValue } from '../../utils/index';
import "./Recorder.css"
import { createUserEvent }  from '../../redux/user-events';

const Recorder = () => {
    const dispatch  = useDispatch<any>();
    const dateStart = useSelector(selectDateStart);

    const isStarted = dateStart !== "";
    let interval    = useRef<number>();

    let secData     = isStarted ? Math.floor((Date.now() - new Date(dateStart).getTime()) / 1000) : 0;
    let hourData    = secData ? Math.floor(secData / 60 / 60) : 0;
    secData -= hourData *60 * 60;

    let minData     = secData ? Math.floor(secData / 60) : 0;
    secData -= minData * 60;
    
    const [ count, setCount ] = useState<number>(0)


    const handleClick = () => {
        if (isStarted) {
            window.clearInterval(interval.current);

            dispatch(createUserEvent());
            dispatch(stop());
        } else {
            dispatch(start());
            interval.current = window.setInterval(() => {
                setCount(count => count + 1);
            }, 1000);
        }
    }

    useEffect(() => {

        return (() => {
            window.clearInterval(interval.current)
        })
    }, [])

  return (
    <div className={ CN('recorder', { 'recorder-started' : isStarted })}>
        <button className="recorder-record" onClick={ handleClick }>
            <span></span>
        </button>
        <div className="recorder-counter">{ `${addZeroTimeValue(hourData)} : ${addZeroTimeValue(minData)} : ${addZeroTimeValue(secData)}` }</div>
    </div>
  )
}

export default Recorder;