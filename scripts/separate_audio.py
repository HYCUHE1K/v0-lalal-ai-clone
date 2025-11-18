import torch
import torchaudio
import sys
import json
import os
from pathlib import Path

def separate_audio(input_file, output_dir, stems_to_extract):
    """
    Separate audio into stems using Demucs model
    
    Args:
        input_file: Path to input audio file
        output_dir: Directory to save separated stems
        stems_to_extract: List of stem names to extract
    """
    try:
        # Load the pre-trained Demucs model
        from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB_PLUS
        
        bundle = HDEMUCS_HIGH_MUSDB_PLUS
        model = bundle.get_model()
        
        # Set device (use GPU if available)
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        model.eval()
        
        print(f"[v0] Loading audio file: {input_file}")
        
        # Load audio file
        waveform, sample_rate = torchaudio.load(input_file)
        
        # Resample if necessary
        if sample_rate != bundle.sample_rate:
            print(f"[v0] Resampling from {sample_rate} to {bundle.sample_rate}")
            resampler = torchaudio.transforms.Resample(sample_rate, bundle.sample_rate)
            waveform = resampler(waveform)
        
        # Convert to stereo if mono
        if waveform.shape[0] == 1:
            waveform = waveform.repeat(2, 1)
        
        # Add batch dimension
        waveform = waveform.unsqueeze(0).to(device)
        
        print("[v0] Processing audio with Demucs model...")
        
        # Process audio through model
        with torch.no_grad():
            sources = model(waveform)
        
        # Demucs outputs: drums, bass, other, vocals
        stem_map = {
            "drums": 0,
            "bass": 1,
            "other": 2,  # other instruments
            "vocals": 3
        }
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        output_files = {}
        
        print("[v0] Saving separated stems...")
        
        # Save requested stems
        for stem_name in stems_to_extract:
            stem_lower = stem_name.lower()
            
            # Map requested stem to model output
            if stem_lower == "vocal" or stem_lower == "vocals":
                stem_idx = stem_map["vocals"]
                output_name = "vocals"
            elif stem_lower == "drums":
                stem_idx = stem_map["drums"]
                output_name = "drums"
            elif stem_lower == "bass":
                stem_idx = stem_map["bass"]
                output_name = "bass"
            elif stem_lower == "instrumental":
                # Combine drums, bass, and other (everything except vocals)
                instrumental = sources[0, [0, 1, 2], :, :].sum(dim=0, keepdim=True)
                output_path = os.path.join(output_dir, "instrumental.wav")
                torchaudio.save(output_path, instrumental.cpu(), bundle.sample_rate)
                output_files["instrumental"] = output_path
                print(f"[v0] Saved instrumental to {output_path}")
                continue
            elif stem_lower in ["guitar", "piano", "other"]:
                # Use "other" stem for these instruments
                stem_idx = stem_map["other"]
                output_name = stem_lower
            else:
                print(f"[v0] Unknown stem: {stem_name}, skipping")
                continue
            
            # Extract and save the stem
            stem_audio = sources[0, stem_idx, :, :]
            output_path = os.path.join(output_dir, f"{output_name}.wav")
            torchaudio.save(output_path, stem_audio.cpu(), bundle.sample_rate)
            output_files[output_name] = output_path
            print(f"[v0] Saved {output_name} to {output_path}")
        
        print("[v0] Audio separation completed successfully")
        
        return {
            "status": "success",
            "output_files": output_files
        }
        
    except Exception as e:
        print(f"[v0] Error during separation: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python separate_audio.py <input_file> <output_dir> <stems_json>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_dir = sys.argv[2]
    stems_json = sys.argv[3]
    
    # Parse stems list
    stems = json.loads(stems_json)
    
    print(f"[v0] Starting audio separation")
    print(f"[v0] Input: {input_file}")
    print(f"[v0] Output: {output_dir}")
    print(f"[v0] Stems: {stems}")
    
    result = separate_audio(input_file, output_dir, stems)
    
    # Output result as JSON
    print(json.dumps(result))
