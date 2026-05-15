import { render, screen } from '@testing-library/react'
import { UnifiedPlayer } from '../UnifiedPlayer'

describe('UnifiedPlayer', () => {
  it('renderiza video HTML5 cuando type es mp4', () => {
    render(<UnifiedPlayer videoUrl="http://test.com/v.mp4" type="mp4" />)
    expect(screen.getByTestId('html5-player')).toBeInTheDocument()
  })

  it('renderiza iframe cuando type es youtube', () => {
    render(<UnifiedPlayer videoUrl="xyz123" type="youtube" />)
    expect(screen.getByTestId('youtube-player')).toBeInTheDocument()
  })
})
