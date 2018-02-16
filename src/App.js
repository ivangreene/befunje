import React, { Component } from 'react';
import befunge from 'befunge';
import { Readable, Writable } from 'stream';
import { TextDecoder } from 'text-encoding';
import samples from './samples';
import './main.css';

class App extends Component {

  state = {
    _program: samples[0].program,
    program: '',
    vProgram: [],
    output: '',
    x: NaN, y: NaN,
    speed: 30,
    pause: false,
    step: true,
    stack: []
  }

  componentWillMount = () => {
    this.loadProgram();
  }

  unpause = () => {
    if (typeof this._unpause === 'function') {
      this.setState({ pause: false }, this._unpause);
    } else {
      this.setState({ pause: true });
    }
  }

  position = (x, y) => {
    if (this.state.step)
      this.setState({ x, y });
  }

  setStep = () => {
    this.setState({ step: !this.state.step });
  }

  setProgram = (event) => {
    this.setState({ _program: event.target.value });
  }

  loadProgram = () => {
    this.setState({ program: this.state._program,
      vProgram: this.state._program.split('\n')
        .map(line => line.split('')),
      x: 0, y: 0, output: '', stack: [] });
  }

  loadSample = (_program) => {
    this.setState({ _program });
  }

  updateVProgram = (vProgram) => {
    this.setState({ vProgram });
  }

  step = (next) => {
    let current = (this.state.vProgram[this.state.y] || [])[this.state.x];
    if (this.state.pause)
      return this._unpause = () => {
        next();
        this._unpause = undefined;
      };
    else if (current) // && current !== ' ')// && this.state.speed)
      return setTimeout(next, this.state.speed);
    return next();
  }

  setSpeed = (event) => {
    this.setState({ speed: (parseInt(event.target.value, 10) || 0) });
  }

  setStack = (stack) => {
    this.setState({ stack });
  }

  runProgram = () => {
    this.setState({ output: '', stack: [] }, () => {
      //this.decoder = new TextDecoder("utf-8").decode;
      this.rs = Readable();
      this.rs._read = () => {
        //this.rs.push('x');
      };
      this.rs.end = () => {};
      this.ws = Writable();
      this.ws._write = (chunk, enc, next) => {
        this.setState({ output: '' + this.state.output +
          new TextDecoder('utf-8').decode(chunk)}, next);
      };
  //    this.rs.pipe(split()).on('data', (line) => {
  //      console.log(line);
  //    });
      befunge(this.state.program, this.rs, this.ws,
        { position: this.state.step ? this.position : undefined,
          step: this.state.step ? this.step : undefined,
          stack: this.setStack, parsed: this.updateVProgram });
    });
  }

  render() {
    return (
      <div>
        <section className="section">
          <div className="container">
            <div className="columns">
              <div className="column">
                <textarea className="textarea" value={this.state._program}
                  onChange={this.setProgram} rows="15"
                  placeholder='"!dlroW ,olleH">,# :# _@'>
                </textarea>
                <br />
                <div className="field is-grouped">
                  <p className="control">
                    <a className="button" onClick={this.runProgram}>Run</a>
                  </p>
                  <p className="control">
                    <a className="button" onClick={this.unpause}>
                      {this.state.pause ? 'Play_' : 'Pause' }
                    </a>
                  </p>
                  <p className="control">
                    <a className="button" onClick={this.loadProgram}>Load</a>
                  </p>
                  { samples.map(sample => <p key={sample.name} className="control"><a className="button"
                    onClick={() => this.loadSample(sample.program)}
                    >{sample.name}</a></p>) }
                </div>
                <div className="field is-grouped">
                <p className="control">
                  <label className="checkbox">
                    <input type="checkbox"
                      checked={this.state.step} onChange={this.setStep} />
                      &nbsp;Step by ms:
                  </label>
                </p>
                <p className="control">
                  <input className="input" type="number"
                    disabled={!this.state.step}
                    value={this.state.speed} onChange={this.setSpeed} />
                </p>
                </div>
              </div>
              <div className="column">
                <pre className="content">
                  Stack:
                  {'\n' + (this.state.stack.join(' ; ') || ' ')}
                </pre>
                <br />
                <pre className="content">
                  {this.state.vProgram.map((line, index) => 
                    <div key={index}>
                      {line.map((c, i) =>
                        <span className={this.state.x === parseInt(i, 10) &&
                          this.state.y === parseInt(index, 10) ?
                          'has-text-danger cursor' : ''}
                          key={i}>{c}</span>)}
                    <br /></div>)
                  }
                </pre>
                <br />
                <pre className="content">
                  {this.state.output}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default App;
