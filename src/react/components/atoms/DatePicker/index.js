import React, { Component } from 'react';
import $ from 'jquery';
import './jquery.calendars.js';
import './jquery.calendars.plus.js';
import './jquery.calendars.ethiopian.js';
import './redmond.calendars.picker.css';
import './jquery.plugin.js';
import './jquery.calendars.picker.js';
import { withStyles } from '@material-ui/core/styles';

const useStyles = (theme) => ({
    muiRoot: {
        verticalAlign: 'top',
        display: "inline-flex",
        width: "13rem",
        margin: "8px 3px",
    },
    label: {
        color: "#333",
        position: "absolute",
        display: "block",
        fontSize: "0.75rem"
    },
    input: {
        background: "transparent",
        padding: "6px 0 7px",
        border: "0px",
        width: "75px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)"
    },
    muiTextField: {
        font: 'inherit',
        display: "block",
        background: "transparent",
        marginTop: "14px",
        height: "1.1876em",
        width: "100%",
        padding: "7px 0",
        border: "0px",
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)"
    }
})

class DatePicker extends Component {

    setNativeValue = (element, value) => {
        const { set: valueSetter } = Object.getOwnPropertyDescriptor(element, 'value') || {}
        const prototype = Object.getPrototypeOf(element)
        const { set: prototypeValueSetter } = Object.getOwnPropertyDescriptor(prototype, 'value') || {}

        if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value)
        } else if (valueSetter) {
            valueSetter.call(element, value)
        } else {
            throw new Error('The given element does not have a value setter')
        }
    }

    componentDidMount() {
        this.$el = $(this.el);
        const calendar = $.calendars.instance('ethiopian');
        this.$el.calendarsPicker({
            calendar,
            minDate: this.props.minDate,
            maxDate: this.props.maxDate,
            onSelect: date => {
                this.setNativeValue(this.el, date);
                const inputEvent = new Event('input', { bubbles: true });
                this.el.dispatchEvent(inputEvent);
            }
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.minDate !== this.props.minDate || prevProps.maxDate !== this.props.maxDate) {
            this.$el = $(this.el);
            this.$el.calendarsPicker('option',
                {
                    minDate: this.props.minDate,
                    maxDate: this.props.maxDate
                })
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={this.props.materialUi && classes.muiRoot}>
                <label className={classes.label}>
                    {this.props.label}
                </label>
                <input
                    id={this.props.id}
                    name={this.props.name}
                    className={this.props.materialUi ? classes.muiTextField : classes.input}
                    type="text"
                    onKeyDown={(e) => e.preventDefault()}
                    ref={el => this.el = el}
                    placeholder={this.props.placeholder}
                    required={this.props.required}
                    onChange={this.props.onChange}
                    value={this.props.value}
                />
            </div>
        )
    }
}

export default withStyles(useStyles)(DatePicker);