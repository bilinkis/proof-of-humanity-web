import { Button, Card, Col, Input, Row, Slider, Typography } from "antd";
import React from "react";
import { FUBIAddress } from "subgraph/config";
const { Text, Title } = Typography;
export default class CreateDelegation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flowsOf: [],
      flows: [],
      rate: 0.01,
      recepient: "",
    };
  }
  createDelegation = () => {
    // console.log(this.props.usedRate);
    const rate = (280000000000000 * this.state.rate) / 100;
    this.props.web3?.contracts?.UBI.methods
      .createDelegation(FUBIAddress, this.state.recepient, rate, "0x0")
      .send({
        from: this.props.submissionID,
        value: 0,
      });
  };
  render() {
    return (
      <>
        <Row justify="center">
          <Col span={12}>
            <Card>
              <Title level={4}>Create a new delegation</Title>

                <Text>Sender: {this.props.submissionID}</Text>
                  <Input
                    type="text"
                    name="recepient"
                    placeholder="Recepient"
                    onChange={(event) => this.setState({ recepient: event.target.value })}
                  />

                  <Text>You can still delegate {100-this.props.usedRate}% of your UBI stream</Text>
                  <Slider min={1} max={100-this.props.usedRate} defaultValue={1} name="rate" onChange={(value)=>this.setState({rate:value})}></Slider>

                <Button onClick={this.createDelegation}>
                  Create delegation!
                </Button>

            </Card>
          </Col>
        </Row>
      </>
    );
  }
}
