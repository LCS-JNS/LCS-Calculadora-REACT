import React, { Component } from "react";
import './Calculator.css'

import Button from "../components/Button";
import Display, { setErrorVisibility } from "../components/Display";

const preSet = {
    displayValue: '0',
    clearDisplay: false,
    operation: null,
    values: [0, 0],
    current: 0,
    minus: false,
    numpad: true
}



export default class Calculator extends Component {

    state = { ...preSet }

    async clearMemory() {
        await this.setState({ ...preSet })
        setErrorVisibility(false)
        
        this.blockNums()
    }

    async setOperation(op) {
        if(this.state.current === 0) {
            await this.setState({ operation: op, current: 1, clearDisplay: true, numpad: true})
            this.blockNums()
        } else {
            const currentOperation = this.state.operation
            let equals = op === '='
            const values = [...this.state.values]
            let displayValue = values[0] + ''
            try {
                if(currentOperation === '%') {
                    const porcentage = values[0]
                    const value = values[1]
                    values[0] = (porcentage / 100) * value
                } else {
                    values[0] = eval(`${values[0]} ${currentOperation} ${values[1]}`)
                }
                displayValue = values[0] + ''
                if(displayValue.includes('.')) {
                    const splitedValue = displayValue.split('.')
                    let preDotValue = splitedValue[0]
                    let postDotValue = splitedValue[1]
                    let preDotValueLength = preDotValue.length
                    if(preDotValue.includes('-')) {
                        preDotValueLength--
                    }
                    if(preDotValueLength >= 13) {
                        displayValue = 'too Big'
                    } else {
                        let countTotal = preDotValueLength
                        let totalSpaceRest = 13 - countTotal                      
                        postDotValue += ''
                        displayValue = `${preDotValue}.${postDotValue.substring(0, totalSpaceRest)}`
                    
                    }
                }
                if(isNaN(values[0] || !isFinite(values[0]))) {
                    this.clearMemory()
                    return
                }
            } catch(e) {
                values[0] = this.state.values[0]
            }
            values[1] = 0
            const sign = Math.sign(values[0]) 
            let minus = false

            if(sign === -1) {
                minus = true
            }
            let current = equals ? 0 : 1
            let displayValueLength = this.getActualLength(displayValue)
            if(displayValueLength > 13 && (displayValue > 9999999999999 || displayValue < -9999999999999 || displayValue.match('[a-z, 0-9]')) ) {
                await this.setState({ numpad: true })
                this.blockNums()
                displayValue = 'too Big.'
                equals = false;
                current = 0
            } else if(this.state.numpad) {
                this.blockNums()
            }

            this.setState({
                displayValue: displayValue,
                operation: equals ? null : op,
                current,
                clearDisplay: !equals,
                values,
                minus
            })
            
        }
    }

    async addDigit(n) {
        
        let displayValue = this.state.displayValue
        
        if((displayValue === '0' || displayValue === '-0') && (n === '0' || n === '0')) {
            return
        }
        if(n === '.' && this.state.displayValue.includes('.')) {
            return
        }

        if(displayValue === '0' || displayValue === '-0') {
            if(displayValue === '0') {
                displayValue = ''
            } else {
                displayValue = '-'
            }
        }

        let minus = this.state.minus
        let clearDisplay = this.state.clearDisplay
        if(clearDisplay) {
            displayValue = n
            clearDisplay = false
            if(minus) {
                minus = false
            }
        } else {
            displayValue += n
        }
        
        
        this.updateError(displayValue)
        let displayValueLength = this.getActualLength(displayValue)
        if(displayValueLength === 13) {
            await this.setState({ numpad: false })
            this.blockNums()
        } else {
            await this.setState({ numpad: true })
            this.blockNums()
        }
        
        this.setState({ displayValue, clearDisplay, minus })
        if(n !== '.') {
            this.insertNumber(displayValue)
        }
    }

    setMinus() {
        const minus = this.state.minus
        let displayValue = this.state.displayValue
        
        if(minus) {
            displayValue = displayValue.replace('-', '')
            this.setState({ displayValue, minus: false })
        } else {
            displayValue = '-' + displayValue
            this.setState({ displayValue, minus: true })
        }
        this.insertNumber(displayValue)
    }

    async bs() {
        let displayValue = this.state.displayValue
        if(displayValue === '0') {
            return
        } if(displayValue.length === 1) {
            displayValue = '0'
        } else {
            displayValue = displayValue.substring(0, displayValue.length - 1)
        }
        this.setState({ displayValue })
        this.insertNumber(displayValue)
        this.updateError(displayValue)
        await this.setState({ numpad: true })
        this.blockNums()
    }

    render() {
        const addDigit = n => this.addDigit(n)
        const setOperation = op => this.setOperation(op)
        const setMinus = () => this.setMinus()
        const bs = () => this.bs()

        return (
            <div className="calculator">
                <Display value={this.state.displayValue} minus={this.state.minus} />
                <Button lable='C' operator click={() => this.clearMemory()}/>
                <Button lable='%' operator  click={setOperation}/>
                <Button lable='/' operator click={setOperation}/>
                <Button lable='⌫' operator click={bs}/>
                <Button lable='7' click={addDigit}/>
                <Button lable='8' click={addDigit}/>
                <Button lable='9' click={addDigit}/>
                <Button lable='*' operator click={setOperation}/>
                <Button lable='4' click={addDigit}/>
                <Button lable='5' click={addDigit}/>
                <Button lable='6' click={addDigit}/>
                <Button lable='-' operator click={setOperation}/>
                <Button lable='1' click={addDigit}/>
                <Button lable='2' click={addDigit}/>
                <Button lable='3' click={addDigit}/>
                <Button lable='+' operator click={setOperation}/>
                <Button lable='±' click={setMinus}/> 
                <Button lable='0' click={addDigit}/>
                <Button lable='.' click={addDigit}/>
                <Button lable='=' operator click={setOperation}/>
            </div>
        )
    }

    insertNumber(displayValue) {
        const i = this.state.current
        const newValue = parseFloat(displayValue)
        const values = [...this.state.values]
        values[i] = newValue
        this.setState({ values })
    }

    updateError(displayValue) {
        let displayValueLength = this.getActualLength(displayValue)
        
        if(displayValueLength >= 13) {
            setErrorVisibility(true)
        } else {
            setErrorVisibility(false)
        }
    }

    blockNums = () => {
        let numButtons = document.querySelectorAll('Button')
        numButtons = [...numButtons]
        let noOperators = []
        numButtons.forEach(item => {
            if(!item.classList.contains('operator')) {
                noOperators.push(item)
            }
        })
        
        noOperators.forEach(btn => {
            if(!this.state.numpad) {
                btn.disabled = true
            } else {
                btn.disabled = false
            }
        })
    }

    getActualLength(displayValue) {
        let displayValueLength = displayValue.length
        if(displayValue.includes('-')) {
            displayValueLength--
        }
        if(displayValue.includes('.')) {
            displayValueLength--
        }
        return displayValueLength
    }
}  