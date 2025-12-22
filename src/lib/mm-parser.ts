/**
 * Parser for FreeMind/Freeplane .mm XML files
 * Converts XML structure to a tree structure compatible with MindmapRenderer
 */

export interface MindmapNode {
  text: string
  children: MindmapNode[]
  _expanded?: boolean
  _nodeId?: string  // Unique identifier for attachments (path-based, e.g., "0", "0-1", "0-1-2")
}

/**
 * Parse a FreeMind/Freeplane .mm XML string into a tree structure
 * @param xmlString - The raw XML content of the .mm file
 * @returns The root node of the parsed mindmap tree
 */
export function parseMMFile(xmlString: string): MindmapNode {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'application/xml')

  // Check for parsing errors
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`XML parsing error: ${parseError.textContent}`)
  }

  // Find the root map element
  const mapElement = doc.querySelector('map')
  if (!mapElement) {
    throw new Error('Invalid .mm file: missing <map> element')
  }

  // Find the root node (first <node> child of <map>)
  const rootNodeElement = mapElement.querySelector(':scope > node')
  if (!rootNodeElement) {
    throw new Error('Invalid .mm file: missing root <node> element')
  }

  return parseNode(rootNodeElement, 0)
}

/**
 * Recursively parse a <node> element and its children
 * @param element - The DOM element to parse
 * @param depth - Current depth in the tree
 * @param pathPrefix - The path prefix for generating node IDs
 */
function parseNode(element: Element, depth: number, pathPrefix: string = '0'): MindmapNode {
  // Get the TEXT attribute (node label)
  const text = element.getAttribute('TEXT') || ''

  // Parse child nodes
  const childElements = element.querySelectorAll(':scope > node')
  const children: MindmapNode[] = []

  childElements.forEach((childElement, index) => {
    const childPath = depth === 0 ? `${pathPrefix}-${index}` : `${pathPrefix}-${index}`
    children.push(parseNode(childElement, depth + 1, depth === 0 ? `0-${index}` : `${pathPrefix}-${index}`))
  })

  return {
    text,
    children,
    // Only root node starts expanded, all others collapsed
    _expanded: depth === 0,
    _nodeId: pathPrefix,
  }
}

/**
 * Assign stable node IDs to a mindmap tree (for trees without IDs)
 * IDs are path-based: "0" for root, "0-0" for first child, "0-0-1" for second grandchild, etc.
 * @param node - The root node of the tree
 * @param pathPrefix - The current path prefix
 * @returns The same tree with node IDs assigned
 */
export function assignNodeIds(node: MindmapNode, pathPrefix: string = '0'): MindmapNode {
  return {
    ...node,
    _nodeId: pathPrefix,
    children: node.children.map((child, index) => 
      assignNodeIds(child, `${pathPrefix}-${index}`)
    ),
  }
}

/**
 * Ensure all nodes in a tree have IDs assigned
 * If root already has an ID, assumes all children do too
 * @param node - The root node to check/update
 * @returns The tree with IDs guaranteed
 */
export function ensureNodeIds(node: MindmapNode): MindmapNode {
  if (node._nodeId) {
    return node
  }
  return assignNodeIds(node)
}

/**
 * Read a File object and parse it as a .mm file
 * @param file - The File object from file input or drag-drop
 * @returns Promise resolving to the parsed mindmap tree
 */
export async function parseMMFileFromFile(file: File): Promise<MindmapNode> {
  const text = await file.text()
  return parseMMFile(text)
}
