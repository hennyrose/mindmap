/**
 * Parser for FreeMind/Freeplane .mm XML files
 * Converts XML structure to a tree structure compatible with MindMapRenderer
 */

export interface MindMapNode {
  text: string
  children: MindMapNode[]
  _expanded?: boolean
}

/**
 * Parse a FreeMind/Freeplane .mm XML string into a tree structure
 * @param xmlString - The raw XML content of the .mm file
 * @returns The root node of the parsed MindMap tree
 */
export function parseMMFile(xmlString: string): MindMapNode {
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
 */
function parseNode(element: Element, depth: number): MindMapNode {
  // Get the TEXT attribute (node label)
  const text = element.getAttribute('TEXT') || ''

  // Parse child nodes
  const childElements = element.querySelectorAll(':scope > node')
  const children: MindMapNode[] = []

  childElements.forEach((childElement) => {
    children.push(parseNode(childElement, depth + 1))
  })

  return {
    text,
    children,
    // Only root node starts expanded, all others collapsed
    _expanded: depth === 0,
  }
}

/**
 * Read a File object and parse it as a .mm file
 * @param file - The File object from file input or drag-drop
 * @returns Promise resolving to the parsed MindMap tree
 */
export async function parseMMFileFromFile(file: File): Promise<MindMapNode> {
  const text = await file.text()
  return parseMMFile(text)
}
