import React, { Component } from "react";
import './Calculator.css'

import Button from "../components/Button";
import Display, { setErrorVisibility } from "../components/Display";

/*
    PreSet: configuração inicial padrão da calculadora.
        displayValue: valor a ser mostrado no display.
        minus: indica se o número atual do display possúi símbolo negativo
        clearDisplay: verificador, se deve ou não se limpar o display.
        operation: aqui ficará salvo a operação a ser realizada.
        values: guardará o valor1 e o valor2 da operação.
        current: armazena qual posição do vetor deve ser manipulada no momento.
        numpad: indica se o teclado numérico está desbloqueado ou não.
*/
const preSet = {
    displayValue: '0',
    minus: false,
    clearDisplay: false,
    operation: null,
    values: [0, 0],
    current: 0,
    numpad: true
}



export default class Calculator extends Component {

    // State da calcluladora passa a ser o "preSet".
    state = { ...preSet }

    /* 
        clearMemory(): função do botão "C" que reseta a calculadora.
        Ela é assíncrona pois a função "setErrorVisibility" necessita do state atualizado após o "setState",
        se o "setState" não tiver "await", a função "setErrorVisibility" vai pegar as informações do state ainda não atualizadas.
        Por fim, se chama a função "blockNums" que irá destravar os botões caso eles estejam travados antes de apertar em "C".
    */
    async clearMemory() {

        // Aguarda a finalização de "this.setState({ ...preSet })".
        await this.setState({ ...preSet })

        // Remove a marca de erro "E" do topo da calculadora.
        setErrorVisibility(false)

        // Desbloqueia o teclado.
        this.blockNums()
    }

    /*
        A fução "setOperation" irá receber a operação do botão pressionado (pegando a lable do botão).
        Ela também é assíncrona pois utiliza dos mesmos casos da "clearMemory".
    */
    async setOperation(op) {

        /*
            A função "setOperation" passa por 2 etapas. Na primeira, o "current" é 0, o que indica que
            devemos apenas armazenar a operação, limpar o display, desbloquear o teclado numéricopara caso ele esteja bloqueado)
            e passar o "current" para 1, assim sinalizando que queremos inserir o segundo valor da operação.
            Depois, aplicar o desbloqueio do teclado numérico.
        */

        // Verifica o "current".
        if(this.state.current === 0) {

            // Aguarda a atualização do state.
            await this.setState({ operation: op, current: 1, clearDisplay: true, numpad: true})

            // Após o state ser atualizado, desbloqueia o teclado numérico.
            this.blockNums()

        } else { // Caso o "current" seja 1

            /*
                No caso de estarmos já no "current" 1, isso significa que já temos o "valor1" e "valor2" armazenados em "values[0, 0]".
                Ou seja, o programa ja pode realizar a operação
            */

            // Salva-se a operação que havia sido selecionada quando o valor1 foi inserido. 
            const currentOperation = this.state.operation

            /*
                Verifica se a operação atual foi "=", pois ele usa uma lógica diferente das outras operações.
                Caso o "=" seja pressionado, isso indica que o usuário quer pegar o resultado da operação
                e não concatenará para a próxima operação, que é o que se acontece caso use qualquer outro operador.
            */
            let equals = op === '='

            // Salva em uma constante "values" os valores já inseridos
            const values = [...this.state.values]

            // Salta em uma variável o string do primeiro valor inserido.
            let displayValue = values[0] + ''

            // Realiza um try/catch para driblar bugs do "eval()"
            try {

                /*
                    Como o operador é passada por meio da lable do botão, não é possível jogar a operação "%"
                    diretamente dentro do "eval", por que "%" em programação significa "resto da divisão",
                    como eu queria que "%" realizasse a porcentagem, essa operação teve de ser feita a parte.
                */
                
                // Verifica se o operador da operação é "%".
                if(currentOperation === '%') {

                    // Pega o operando que vai ser a parte.
                    const porcentage = values[0]
                    
                    // Pega o operando que indica o total.
                    const value = values[1]

                    // Realiza a operação de porcentagem.
                    values[0] = (porcentage / 100) * value

                    // Caso o operador não seja "%" realiza o "eval"
                } else {

                    // Atribui ao primeiro valor da lista "values[0, 0]" o resultado da operação
                    values[0] = eval(`${values[0]} ${currentOperation} ${values[1]}`)

                }

                // Transforma este novo valor em string novamente
                displayValue = values[0] + ''

                /*
                    Aqui acontece algo importante. No decorrer do programa, caso o tamanho de um número
                    seja maior que o limite do display (13), ele exibe "too Big.", porém, caso seja um número com virgula
                    e o número após a vírgula for muito grande, se é cortado no mínimo dos números após a vírgula para que 
                    o número a ser exibido no display, seja de tamanho max 13.

                    Exemplo: 

                        resultado = 15354.153551486524

                        Este número contém 17 caractéres sem contar o ".", ou seja, seria considerado "too Big."
                        Mas para que isso não aconteça, o número poderia ser arredondado para "15354.15355149"
                        permitindo assim que o número seja exibido.
                */


                if(displayValue.includes('.')) {
                    const splitedValue = displayValue.split('.')
                    let preDotValue = splitedValue[0]
                    let postDotValue = splitedValue[1]
                    let preDotValueLength = preDotValue.length
                    if(preDotValue.includes('-')) {
                        preDotValueLength--
                    }
                    if(preDotValueLength >= 13) {
                        displayValue = 'too Big.'
                    } else {
                        let countTotal = preDotValueLength
                        let totalSpaceRest = 13 - countTotal 
                        if(totalSpaceRest < postDotValue.length) {
                            const preTransformation = postDotValue.substring(0, totalSpaceRest - 1)
                            const lastTwoNums = postDotValue.substring(totalSpaceRest - 1, totalSpaceRest + 1)
                            let beforeLastNumPostDotValue = parseInt(lastTwoNums.charAt(0))
                            const lastNumPostDotValue = parseInt(lastTwoNums.charAt(1))
                            if(lastNumPostDotValue >= 5) {
                                beforeLastNumPostDotValue++
                                postDotValue = `${preTransformation}${beforeLastNumPostDotValue}`
                            } 
                            
                        }    
                            
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