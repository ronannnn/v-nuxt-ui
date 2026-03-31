declare namespace Model {
  type Flow = {
    name?: string
    description?: string
    nodes?: FlowNode[]
    links?: FlowNodeLink[]
  } & BaseModel

  type FlowNode = {
    flowId?: number
    name?: string
    positionX?: number
    positionY?: number
    width?: number
    height?: number
    indicators?: Indicator[]
    parentLinks?: FlowNodeLink[]
    childLinks?: FlowNodeLink[]
  } & BaseModel

  type FlowNodeLink = {
    flowId?: number
    parentId?: number
    parentHandlePos?: string
    childId?: number
    childHandlePos?: string
    label?: string
    condition?: string
    order?: number
  } & BaseModel
}
