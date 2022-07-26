import {
  Button,
  Card,
  Col,
  Input,
  message,
  Row,
  Select,
  Slider,
  Typography,
} from "antd";
import React from "react";
import { FUBIAddress, SUBIAddress } from "subgraph/config";
const { Text, Title } = Typography;
export default class CreateDelegation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flowsOf: [],
      flows: [],
      rate: 0.01,
      recepient: "",
      target: "fubi",
    };
  }
  createDelegation = () => {
    // console.log(this.props.usedRate);
    if (this.state.recepient === "") {
      return message.error("Please enter the recepient address.");
    }
    if (
      this.state.recepient.substring(0, 2) !== "0x" &&
      this.state.recepient.length !== 42
    ) {
      return message.error("Make sure you entered a correct Ethereum Address");
    }
    const rate = (280000000000000 * this.state.rate) / 100;
    //console.log(this.state.target);
    const implementation =
      this.state.target === "fubi" ? FUBIAddress : SUBIAddress;
    //console.log(implementation);
    this.setState({loading:true})
    this.props.web3?.contracts?.UBI.methods
      .createDelegation(implementation, this.state.recepient, rate, "0x0")
      .send({
        from: this.props.submissionID,
        value: 0,
      }).on('receipt',()=>{
        window.location.reload(false);
      })
      .on('error',()=>{
        message.error("There was an error with your transaction")
        this.setState({loading:false})
      })
  };
  render() {
    return (
      <>
        <Row justify="center">
          <Col span={12}>
            <Card>
              <Title level={4}>Create a new delegation</Title>
              <Select
                onChange={(value) => this.setState({ target: value })}
                style={{ width: "100%" }}
                defaultValue="fubi"
              >
                <Select.Option value="fubi">FUBI</Select.Option>
                <Select.Option value="subi">SUBI</Select.Option>
              </Select>
              <Text>Sender: {this.props.submissionID}</Text>
              <Input
                type="text"
                name="recepient"
                placeholder="Recepient"
                onChange={(event) =>
                  this.setState({ recepient: event.target.value })
                }
              />

              <Text>
                You can still delegate {100 - this.props.usedRate}% of your UBI
                stream
              </Text>
              <Slider
                min={1}
                max={100 - this.props.usedRate}
                defaultValue={1}
                name="rate"
                onChange={(value) => this.setState({ rate: value })}
              ></Slider>

              <Button onClick={this.createDelegation} className="button-orange" loading={this.state.loading}>
                Create delegation!
              </Button>
            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
