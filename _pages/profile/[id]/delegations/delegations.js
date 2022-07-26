import { Text } from "@kleros/components";
import React from "react";
import { Button, Card, Col, message, Row, Spin, Typography } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
const { Title } = Typography;
import { FUBIAddress } from "subgraph/config";
import CreateDelegation from "./create-delegation";
export default class Delegations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usedRate: 0,
      loading:true
    };
  }
  
  componentDidMount = () => {
    this.props.web3.contracts?.UBI?.methods.getAccruedPerSecond()
      .call()
      .then((accruedPerSecond) => {
        this.props.web3.contracts?.FUBI?.methods
          .getFlowsOf(this.props.submissionID)
          .call()
          .then((flowsOf) => {
            let flows = [];
            let totalRate = 0;
            if (flowsOf?.length > 0) {
              for (let i = 0; i < flowsOf.length; i++) {
                this.props.web3.contracts?.FUBI?.methods
                  .getDelegationInfo(flowsOf[i])
                  .call()
                  .then((flow) => {
                    flows.push({ id: flowsOf[i], ...flow });
                    totalRate += Number(flow.ratePerSecond);
                    this.setState({
                      usedRate: Math.round(
                        (totalRate / accruedPerSecond) * 100
                      ),
                    });
                  });
              }
            }
            this.setState({ flowsOf: flowsOf, flows: flows, loading:false });
          });
      });
  };
  cancelDelegation = (flowID) => {
    this.props.web3.contracts.UBI?.methods
      .cancelDelegation(FUBIAddress, flowID)
      .send({
        from: this.props.submissionID,
        value: 0,
      }).on('receipt',()=>{
        window.location.reload(false);
      })
      .on('error',()=>{
        message.error("There was an error with your transaction")
      })
  };

  render() {
    return (
      <>
      {this.state.loading ? <Row justify="center"><Spin indicator={ <LoadingOutlined style={{ fontSize: "10%" }} spin /> } /></Row> : 
      <>
        {this.state.flows?.length > 0 ? (
          <>
            <Title level={4} style={{margin:"0 auto"}}>Your current outgoing delegations</Title>
            <Row justify="center" style={{marginBottom:"20px"}}>
              {this.state.flows.map((flow, i) => {
                return (
                  <Col span={6} key={i}>
                    <Card>
                      <Text>Flow ID: {flow.id}</Text>
                      <Text>Flow recepient: {flow.recipient}</Text>
                      <Text>
                        UBI Rate:{" "}
                        {Math.round(
                          (flow.ratePerSecond / 280000000000000) * 100
                        )}
                        %
                      </Text>
                      <Button className="button-orange" onClick={() => this.cancelDelegation(flow.id)} loading={this.state.loading}>
                        Cancel this Delegation
                      </Button>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </>
        ) : null}
        
        {this.state.usedRate < 100 ? (
          <CreateDelegation
            submissionID={this.props.submissionID}
            web3={this.props.web3}
            usedRate={this.state.usedRate}
          />
        ) : (
          <Text>You don&apos;t have any UBI available to delegate</Text>
        )}
        </>
      
    }
</>
    );
  }
}
